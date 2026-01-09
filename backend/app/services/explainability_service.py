import sys
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import numpy as np

# Optional imports for ML functionality
try:
    import torch

    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None
    logging.warning(
        "PyTorch not available. LSTM explainability features will be disabled."
    )

try:
    import shap

    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    shap = None
    logging.warning("SHAP not available. Explainability features will be disabled.")

# Ensure ml/scripts is on the path so we can reuse the training code
PROJECT_ROOT = Path(__file__).resolve().parents[3]
ML_SCRIPTS_DIR = PROJECT_ROOT / "ml" / "scripts"

if str(ML_SCRIPTS_DIR) not in sys.path:
    sys.path.append(str(ML_SCRIPTS_DIR))

# Lazy import of training modules to avoid torch dependency at module level
LSTMModel = None
GRUModel = None
prepare_data = None


def _import_training_modules(model_type: str = "lstm"):
    """Lazy import of training modules - only when needed and if torch is available."""
    global LSTMModel, GRUModel, prepare_data
    if not TORCH_AVAILABLE:
        raise ImportError("PyTorch is required to use models")

    try:
        if model_type == "lstm" and LSTMModel is None:
            from train_lstm import (
                LSTMModel as _LSTMModel,
                prepare_data as _prepare_data,
            )  # type: ignore  # noqa: E402

            LSTMModel = _LSTMModel
            prepare_data = _prepare_data
        elif model_type == "gru" and GRUModel is None:
            from train_gru import (
                GRUModel as _GRUModel,
                prepare_data as _prepare_data,
            )  # type: ignore  # noqa: E402

            GRUModel = _GRUModel
            if prepare_data is None:
                # Import prepare_data from train_lstm if not already imported
                from train_lstm import prepare_data as _prepare_data_lstm  # type: ignore  # noqa: E402

                prepare_data = _prepare_data_lstm
    except ImportError as e:
        logger.warning(f"Could not import training modules for {model_type}: {e}")
        raise

    if model_type == "lstm":
        return LSTMModel, prepare_data
    elif model_type == "gru":
        return GRUModel, prepare_data
    else:
        raise ValueError(f"Unknown model type: {model_type}")


logger = logging.getLogger(__name__)


class ModelExplainabilityService:
    """
    Service to provide SHAP-based explainability for LSTM and GRU price prediction models.

    This service:
    - Loads trained models (LSTM/GRU) and associated scalers saved by training scripts
    - Uses the same feature engineering as training via `prepare_data`
    - Computes SHAP values for the most recent sequence and aggregates per-feature importance
    """

    def __init__(
        self,
        model_dir: Path | None = None,
        sequence_length: int = 120,  # Updated to match notebook LOOKBACK=120
        background_samples: int = 100,
    ) -> None:
        self.sequence_length = sequence_length
        self.background_samples = background_samples
        # By default, assume models are saved under ml/scripts/models when training script is run there
        self.model_dir = model_dir or (ML_SCRIPTS_DIR / "models")

    def _load_model_and_data(
        self, symbol: str, model_type: str = "lstm"
    ) -> Dict[str, Any]:
        """
        Load trained model (LSTM or GRU), scaler and prepared data for a symbol.

        Relies on files saved by training scripts:
        - ml/scripts/models/{model_type}_{symbol}.pth
        - ml/scripts/models/{model_type}_{symbol}_scaler.pkl
        """
        if not TORCH_AVAILABLE:
            raise ImportError(
                "PyTorch is not installed. Please install it with: pip install torch"
            )

        symbol_lower = symbol.lower()
        model_path = self.model_dir / f"{model_type}_{symbol_lower}.pth"
        scaler_path = self.model_dir / f"{model_type}_{symbol_lower}_scaler.pkl"

        if not model_path.exists() or not scaler_path.exists():
            raise FileNotFoundError(
                f"{model_type.upper()} model or scaler not found for symbol '{symbol}'. "
                f"Expected at: {model_path} and {scaler_path}. "
                f"Train the model with ml/scripts/train_{model_type}.py before requesting explanations."
            )

        # Import training modules
        prepare_data_fn = _import_training_modules(model_type)[1]

        # Prepare data using the same pipeline as training
        X_train, X_test, y_train, y_test, scaler = prepare_data_fn(
            symbol, sequence_length=self.sequence_length
        )

        if len(X_train) == 0:
            raise ValueError(
                f"Not enough training data to compute SHAP values for symbol '{symbol}'."
            )

        # Determine input size from prepared data
        input_size = X_train.shape[2]

        # Import model class
        ModelClass, _ = _import_training_modules(model_type)

        # Recreate model architecture (must match training hyperparameters)
        model = ModelClass(
            input_size=input_size,
            output_size=1,
        )

        if not TORCH_AVAILABLE:
            raise ImportError("PyTorch is required to load models")
        state_dict = torch.load(model_path, map_location=torch.device("cpu"))

        # Check if model architecture matches
        try:
            model.load_state_dict(state_dict, strict=True)
        except RuntimeError as e:
            # Check if this is an architecture mismatch
            if "Missing key" in str(e) or "Unexpected key" in str(e):
                logger.error(
                    f"Model architecture mismatch for {model_type} {symbol}. "
                    f"The saved model uses an old architecture. "
                    f"Please retrain the model with the new architecture using: "
                    f"python ml/scripts/train_{model_type}.py --symbol {symbol} --epochs 200"
                )
                raise RuntimeError(
                    f"Model architecture mismatch. The saved {model_type} model for {symbol} was trained with an old architecture. "
                    f"Please retrain the model. Run: cd ml/scripts && python train_{model_type}.py --symbol {symbol} --epochs 200"
                ) from e
            else:
                raise

        model.eval()

        # Load scaler
        import pickle

        with scaler_path.open("rb") as f:
            loaded_scaler = pickle.load(f)

        return {
            "model": model,
            "scaler": loaded_scaler,
            "X_train": X_train,
            "X_test": X_test,
            "y_test": y_test,
        }

    def _compute_shap_values(
        self, model: Any, X_train: np.ndarray, X_sample: np.ndarray
    ) -> Dict[str, Any]:
        """
        Compute SHAP values for a single sample using a background subset from X_train.

        Returns:
        - shap_values: raw SHAP values array
        - expected_value: SHAP base value
        """
        # Select background samples for DeepExplainer (limit for performance)
        background_size = min(self.background_samples, len(X_train))
        background = torch.from_numpy(X_train[:background_size]).float()

        sample = torch.from_numpy(X_sample).float()

        # Use Explainer for PyTorch models (newer SHAP API, PyTorch-compatible)
        def model_fn(x: np.ndarray) -> np.ndarray:
            """Wrapper function for SHAP that converts numpy to torch and back"""
            if isinstance(x, torch.Tensor):
                x_tensor = x
            else:
                x_tensor = torch.from_numpy(x).float()
            with torch.no_grad():
                output = model(x_tensor).squeeze(-1)
                if isinstance(output, torch.Tensor):
                    output = output.numpy()
            return output

        # Use the newer Explainer API which supports PyTorch
        try:
            explainer = shap.Explainer(model_fn, background.numpy())
            shap_result = explainer(sample.numpy())

            # Extract values based on explainer type
            if hasattr(shap_result, "values"):
                shap_values = shap_result.values
            else:
                shap_values = shap_result

            # Extract base/expected value
            if hasattr(shap_result, "base_values"):
                expected_value = shap_result.base_values
            elif hasattr(explainer, "expected_value"):
                expected_value = explainer.expected_value
            else:
                # Calculate expected value from background
                with torch.no_grad():
                    background_output = model(background).squeeze(-1).numpy()
                expected_value = float(np.mean(background_output))

        except Exception as e:
            logger.warning(f"SHAP Explainer failed: {e}. Using fallback approximation.")
            # Fallback: simple approximation using mean
            with torch.no_grad():
                sample_output = model(sample).squeeze(-1).numpy()
                background_output = model(background).squeeze(-1).numpy()

            expected_value = float(np.mean(background_output))
            # Simple feature importance approximation
            shap_values = np.zeros_like(sample.numpy())
            shap_values[0, :] = (
                sample.numpy()[0, :] - background.numpy().mean(axis=0)
            ) * 0.1  # Simplified

        # Normalize shap_values to array
        if isinstance(shap_values, list):
            shap_array = (
                np.array(shap_values[0])
                if len(shap_values) > 0
                else np.array(shap_values)
            )
        else:
            shap_array = np.array(shap_values)

        # Handle expected_value extraction
        if isinstance(expected_value, (list, np.ndarray)):
            expected_val = float(np.mean(expected_value))
        else:
            expected_val = float(expected_value) if expected_value is not None else 0.0

        return {
            "shap_values": shap_array,
            "expected_value": expected_val,
        }

    async def explain_prediction(
        self, symbol: str, model_type: str = "lstm"
    ) -> Dict[str, Any]:
        """
        Compute prediction and SHAP-based feature attributions for the latest model prediction.

        Args:
            symbol: Stock symbol
            model_type: "lstm" or "gru"

        Returns a JSON-serializable dict containing:
        - symbol
        - prediction (actual price)
        - model_output (scaled output)
        - base_value
        - feature_importances: list of {name, importance}
        - model_type: "lstm" or "gru"
        """
        try:
            data = self._load_model_and_data(symbol, model_type)
            model = data["model"]
            scaler = data["scaler"]
            X_train: np.ndarray = data["X_train"]
            X_test: np.ndarray = data["X_test"]

            if len(X_test) == 0:
                raise ValueError(
                    f"Not enough test data to explain latest prediction for '{symbol}'."
                )

            # Use the most recent test sequence as the sample to explain
            X_sample = X_test[-1:].copy()

            # Run model prediction on the sample
            if not TORCH_AVAILABLE:
                raise ImportError("PyTorch is required for model inference")
            with torch.no_grad():
                model_output = (
                    model(torch.from_numpy(X_sample).float()).numpy().reshape(-1)[0]
                )

            # Inverse transform to original price scale (Close is first feature)
            num_features = X_train.shape[2]
            dummy_features = np.zeros((1, num_features))
            dummy_features[:, 0] = model_output
            prediction_actual = scaler.inverse_transform(dummy_features)[:, 0][0]

            shap_result = self._compute_shap_values(model, X_train, X_sample)
            shap_values = shap_result["shap_values"]
            expected_value_scaled = shap_result["expected_value"]

            # Inverse transform base_value to original price scale (same as prediction)
            base_value_dummy = np.zeros((1, num_features))
            base_value_dummy[:, 0] = expected_value_scaled
            base_value_actual = scaler.inverse_transform(base_value_dummy)[:, 0][0]

            # Aggregate SHAP values across time steps to get per-feature importance
            # shap_values shape: (1, sequence_length, num_features)
            shap_for_sample = shap_values[0]
            per_feature_importance = np.mean(np.abs(shap_for_sample), axis=0)

            # Feature names must match those used in train_lstm.prepare_data
            # Updated to match notebook: Close, MA_20, MA_50, Volatility (4 features)
            feature_names: List[str] = [
                "Close",
                "MA_20",
                "MA_50",
                "Volatility",
            ]

            if len(feature_names) != per_feature_importance.shape[0]:
                logger.warning(
                    "Feature count mismatch between SHAP values and expected feature names "
                    f"({per_feature_importance.shape[0]} vs {len(feature_names)})."
                )

            feature_importances: List[Dict[str, Any]] = []
            for idx, name in enumerate(
                feature_names[: per_feature_importance.shape[0]]
            ):
                feature_importances.append(
                    {
                        "name": name,
                        "importance": float(per_feature_importance[idx]),
                    }
                )

            # Sort by absolute importance descending
            feature_importances.sort(key=lambda x: abs(x["importance"]), reverse=True)

            return {
                "symbol": symbol.upper(),
                "prediction": float(prediction_actual),
                "model_output": float(model_output),
                "base_value": float(base_value_actual),
                "feature_importances": feature_importances,
                "model_type": model_type,
                "timestamp": datetime.now(),
            }

        except FileNotFoundError:
            # Re-raise to allow API layer to map to a 503/404
            raise
        except Exception as e:
            logger.error(
                f"Error computing {model_type.upper()} SHAP explanation for {symbol}: {e}",
                exc_info=True,
            )
            raise

    async def explain_lstm_prediction(self, symbol: str) -> Dict[str, Any]:
        """Convenience method for LSTM explainability (backward compatibility)"""
        return await self.explain_prediction(symbol, "lstm")

    async def explain_gru_prediction(self, symbol: str) -> Dict[str, Any]:
        """Convenience method for GRU explainability"""
        return await self.explain_prediction(symbol, "gru")
