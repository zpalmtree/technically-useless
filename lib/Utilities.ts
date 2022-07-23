import { Level, OHLCV } from './Types.js';
import { RSI_DISTANCE_INDICATOR } from './Constants.js';

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatOHLCV(candles: number[][]): OHLCV {
    const opens = [];
    const highs = [];
    const lows = [];
    const closes = [];
    const volumes = [];

    for (const candle of candles) {
        const [
            timestamp,
            open,
            high,
            low,
            close,
            volume,
        ] = candle;

        opens.push(open);
        highs.push(high);
        lows.push(low);
        closes.push(close);
        volumes.push(volume);
    }

    return {
        opens,
        highs,
        lows,
        closes,
        volumes,
    };
}

export function previousImportantRSILevel(previousRSIs: number[]) {
    let lastCandle = previousRSIs[previousRSIs.length - 1];

    const assumedLevel = lastCandle >= 50 ? Level.Positive : Level.Negative;

    for (let i = previousRSIs.length - 1; i >= 0; i--) {
        const current = previousRSIs[i];

        if (current >= 50 + RSI_DISTANCE_INDICATOR) {
            return Level.Positive;
        }

        if (current <= 50 - RSI_DISTANCE_INDICATOR) {
            return Level.Negative;
        }
    }

    return assumedLevel;
}
