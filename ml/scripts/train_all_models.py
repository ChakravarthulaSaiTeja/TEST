#!/usr/bin/env python3
"""
Train all three models (LSTM, GRU, Attention LSTM) for NIFTY 50
This script will train all models and save them for use in predictions
"""

import subprocess
import sys
import os
from pathlib import Path

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
MODEL_DIR = SCRIPT_DIR / "models"

def main():
    """Train all three models for NIFTY 50"""
    
    symbol = "^NSEI"
    epochs = 200
    sequence_length = 120
    
    print("=" * 80)
    print("Training All Models for NIFTY 50")
    print("=" * 80)
    print(f"Symbol: {symbol}")
    print(f"Epochs: {epochs}")
    print(f"Sequence Length: {sequence_length}")
    print(f"Model Directory: {MODEL_DIR}")
    print("=" * 80)
    
    # Ensure model directory exists
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    models_to_train = [
        ("LSTM", "train_lstm.py"),
        ("GRU", "train_gru.py"),
        ("Attention LSTM", "train_attention_lstm.py"),
    ]
    
    results = {}
    
    for model_name, script_name in models_to_train:
        print(f"\n{'=' * 80}")
        print(f"Training {model_name} Model")
        print(f"{'=' * 80}")
        
        script_path = SCRIPT_DIR / script_name
        
        try:
            # Run training script
            result = subprocess.run(
                [
                    sys.executable,
                    str(script_path),
                    "--symbol", symbol,
                    "--epochs", str(epochs),
                    "--sequence_length", str(sequence_length),
                ],
                cwd=SCRIPT_DIR,
                check=True,
                capture_output=False,  # Show output in real-time
            )
            
            results[model_name] = "SUCCESS"
            print(f"\n✅ {model_name} training completed successfully!")
            
        except subprocess.CalledProcessError as e:
            results[model_name] = f"FAILED: {e}"
            print(f"\n❌ {model_name} training failed!")
            print(f"Error: {e}")
        except Exception as e:
            results[model_name] = f"ERROR: {e}"
            print(f"\n❌ {model_name} training encountered an error!")
            print(f"Error: {e}")
    
    # Summary
    print("\n" + "=" * 80)
    print("Training Summary")
    print("=" * 80)
    
    for model_name, status in results.items():
        status_icon = "✅" if status == "SUCCESS" else "❌"
        print(f"{status_icon} {model_name}: {status}")
    
    # Check which models were saved
    print("\n" + "=" * 80)
    print("Saved Models")
    print("=" * 80)
    
    model_files = {
        "LSTM": [
            MODEL_DIR / f"lstm_{symbol.lower()}.pth",
            MODEL_DIR / f"lstm_{symbol.lower()}_scaler.pkl",
        ],
        "GRU": [
            MODEL_DIR / f"gru_{symbol.lower()}.pth",
            MODEL_DIR / f"gru_{symbol.lower()}_scaler.pkl",
        ],
        "Attention LSTM": [
            MODEL_DIR / f"attention_lstm_{symbol.lower()}.pth",
            MODEL_DIR / f"attention_lstm_{symbol.lower()}_scaler.pkl",
        ],
    }
    
    for model_name, files in model_files.items():
        all_exist = all(f.exists() for f in files)
        status_icon = "✅" if all_exist else "❌"
        print(f"{status_icon} {model_name}:")
        for f in files:
            exists = "✓" if f.exists() else "✗"
            print(f"  {exists} {f.name}")
    
    print("\n" + "=" * 80)
    print("Training Complete!")
    print("=" * 80)
    print(f"\nModels saved to: {MODEL_DIR}")
    print("\nYou can now use these models for predictions in the backend.")
    print("=" * 80)


if __name__ == "__main__":
    main()
