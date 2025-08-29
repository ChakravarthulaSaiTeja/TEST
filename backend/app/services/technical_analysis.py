import pandas as pd
import numpy as np
from typing import Dict, Any


class TechnicalAnalysisService:
    """Service for calculating technical indicators"""

    def __init__(self):
        pass

    def calculate_indicators(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Calculate technical indicators for the given data"""
        try:
            if data.empty:
                return {}

            close_prices = data["Close"]
            high_prices = data["High"]
            low_prices = data["Low"]
            volume = data["Volume"]

            indicators = {}

            # RSI
            indicators["rsi"] = self._calculate_rsi(close_prices)

            # MACD
            macd, signal, histogram = self._calculate_macd(close_prices)
            indicators["macd"] = macd.iloc[-1] if not macd.empty else 0
            indicators["macd_signal"] = signal.iloc[-1] if not signal.empty else 0
            indicators["macd_histogram"] = (
                histogram.iloc[-1] if not histogram.empty else 0
            )

            # Moving Averages
            indicators["sma_20"] = close_prices.rolling(window=20).mean().iloc[-1]
            indicators["sma_50"] = close_prices.rolling(window=50).mean().iloc[-1]
            indicators["sma_200"] = close_prices.rolling(window=200).mean().iloc[-1]

            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = self._calculate_bollinger_bands(
                close_prices
            )
            indicators["bollinger_upper"] = (
                bb_upper.iloc[-1] if not bb_upper.empty else 0
            )
            indicators["bollinger_middle"] = (
                bb_middle.iloc[-1] if not bb_middle.empty else 0
            )
            indicators["bollinger_lower"] = (
                bb_lower.iloc[-1] if not bb_lower.empty else 0
            )

            # Stochastic
            stoch_k, stoch_d = self._calculate_stochastic(
                high_prices, low_prices, close_prices
            )
            indicators["stochastic_k"] = stoch_k.iloc[-1] if not stoch_k.empty else 0
            indicators["stochastic_d"] = stoch_d.iloc[-1] if not stoch_d.empty else 0

            # Williams %R
            indicators["williams_r"] = self._calculate_williams_r(
                high_prices, low_prices, close_prices
            )

            # CCI
            indicators["cci"] = self._calculate_cci(
                high_prices, low_prices, close_prices
            )

            return indicators

        except Exception as e:
            print(f"Error calculating indicators: {e}")
            return {}

    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate RSI (Relative Strength Index)"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def _calculate_macd(
        self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9
    ) -> tuple:
        """Calculate MACD (Moving Average Convergence Divergence)"""
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=signal).mean()
        histogram = macd - signal_line
        return macd, signal_line, histogram

    def _calculate_bollinger_bands(
        self, prices: pd.Series, period: int = 20, std_dev: int = 2
    ) -> tuple:
        """Calculate Bollinger Bands"""
        sma = prices.rolling(window=period).mean()
        std = prices.rolling(window=period).std()
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        return upper_band, sma, lower_band

    def _calculate_stochastic(
        self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
    ) -> tuple:
        """Calculate Stochastic Oscillator"""
        lowest_low = low.rolling(window=period).min()
        highest_high = high.rolling(window=period).max()

        k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
        d_percent = k_percent.rolling(window=3).mean()

        return k_percent, d_percent

    def _calculate_williams_r(
        self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
    ) -> float:
        """Calculate Williams %R"""
        try:
            highest_high = high.rolling(window=period).max().iloc[-1]
            lowest_low = low.rolling(window=period).min().iloc[-1]
            current_close = close.iloc[-1]

            if highest_high == lowest_low:
                return 0

            williams_r = -100 * (
                (highest_high - current_close) / (highest_high - lowest_low)
            )
            return williams_r
        except:
            return 0

    def _calculate_cci(
        self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 20
    ) -> float:
        """Calculate CCI (Commodity Channel Index)"""
        try:
            typical_price = (high + low + close) / 3
            sma = typical_price.rolling(window=period).mean()
            mean_deviation = typical_price.rolling(window=period).apply(
                lambda x: np.mean(np.abs(x - x.mean()))
            )

            cci = (typical_price - sma) / (0.015 * mean_deviation)
            return cci.iloc[-1]
        except:
            return 0

    def get_recommendation(self, indicators: Dict[str, Any]) -> str:
        """Get trading recommendation based on indicators"""
        try:
            rsi = indicators.get("rsi", 50)
            macd = indicators.get("macd", 0)
            macd_signal = indicators.get("macd_signal", 0)

            # Simple recommendation logic
            if rsi < 30 and macd > macd_signal:
                return "Strong Buy"
            elif rsi < 40 and macd > macd_signal:
                return "Buy"
            elif rsi > 70 and macd < macd_signal:
                return "Strong Sell"
            elif rsi > 60 and macd < macd_signal:
                return "Sell"
            else:
                return "Hold"

        except:
            return "Hold"

    def get_confidence_score(self, indicators: Dict[str, Any]) -> float:
        """Get confidence score for the recommendation"""
        try:
            # Simple confidence calculation
            confidence = 0.5  # Base confidence

            # Adjust based on RSI extremes
            rsi = indicators.get("rsi", 50)
            if rsi < 20 or rsi > 80:
                confidence += 0.3
            elif rsi < 30 or rsi > 70:
                confidence += 0.2

            # Adjust based on MACD alignment
            macd = indicators.get("macd", 0)
            macd_signal = indicators.get("macd_signal", 0)
            if abs(macd - macd_signal) > 0.01:
                confidence += 0.2

            return min(confidence, 1.0)

        except:
            return 0.5
