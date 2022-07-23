import { RSI as RSIIndicator } from 'technicalindicators';

import { Trend, Signal } from './Types.js';
import { RSI_DISTANCE_INDICATOR } from './Constants.js';

export class RSI {
    private indicator: RSIIndicator;

    private previousRSI: number;

    private price: number;

    public trend: Trend;

    constructor(values: number[], price: number) {
        this.indicator = new RSIIndicator({
            values,
            period: 14,
        });

        this.price = price;

        this.previousRSI = this.indicator.nextValue(this.price)!;

        this.trend = this.previousRSITrend([
            ...this.indicator.getResult(),
            this.previousRSI,
        ]);
    }

    public processNewData(values: number[], price: number): Signal {
        this.price = price;

        this.indicator = new RSIIndicator({
            values,
            period: 14,
        });

        const rsi = this.indicator.nextValue(this.price)!;

        let signal = Signal.None;
        let newTrend = this.trend;

        if (rsi >= (50 + RSI_DISTANCE_INDICATOR) && this.trend === Trend.Negative) {
            newTrend = Trend.Positive;
            signal = Signal.Long;
        }

        if (rsi <= (50 - RSI_DISTANCE_INDICATOR) && this.trend === Trend.Positive) {
            newTrend = Trend.Negative;
            signal = Signal.Short;
        }

        this.previousRSI = rsi;
        this.trend = newTrend;

        return signal;
    }

    private previousRSITrend(previousRSIs: number[]): Trend {
        let lastCandle = previousRSIs[previousRSIs.length - 1];

        const assumedTrend = lastCandle >= 50 ? Trend.Positive : Trend.Negative;

        for (let i = previousRSIs.length - 1; i >= 0; i--) {
            const current = previousRSIs[i];

            if (current >= 50 + RSI_DISTANCE_INDICATOR) {
                return Trend.Positive;
            }

            if (current <= 50 - RSI_DISTANCE_INDICATOR) {
                return Trend.Negative;
            }
        }

        return assumedTrend;
    }
}
