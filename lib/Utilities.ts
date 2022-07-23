import { OHLCV } from './Types.js';

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
