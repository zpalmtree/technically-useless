import { AwesomeOscillator as AwesomeIndicator } from 'technicalindicators';

import { Trend, Signal } from './Types.js';
import { AWESOME_TREND_PERIODS } from './Constants.js';

export class AwesomeOscillator {
    private indicator: AwesomeIndicator;

    public trend: Trend;

    constructor(highs: number[], lows: number[]) {
        this.indicator = new AwesomeIndicator({
            high: highs,
            low: lows,
            fastPeriod: 5,
            slowPeriod: 34,
        });

        this.trend = this.previousAwesomeTrend(this.indicator.getResult());
    }

    public processNewData(highs: number[], lows: number[]): Signal {
        this.indicator = new AwesomeIndicator({
            high: highs,
            low: lows,
            fastPeriod: 5,
            slowPeriod: 34,
        });

        const results = this.indicator.getResult();

        let awesome = results[results.length - 1];
        let previousValue = awesome;

        if (this.trend === Trend.Positive && awesome < 0) {
            let negativeRedCandles = 1;

            for (let i = results.length - 2; i >= 0; i--) {
                if (results[i] < 0) {
                    if (results[i] > previousValue) {
                        negativeRedCandles++;
                    }
                } else {
                    break;
                }

                previousValue = results[i];
            }

            if (negativeRedCandles > AWESOME_TREND_PERIODS) {
                this.trend = Trend.Negative;
                return Signal.Short;
            }
        }

        if (this.trend === Trend.Negative && awesome > 0) {
            let positiveGreenCandles = 1;

            for (let i = results.length - 2; i >= 0; i--) {
                if (results[i] > 0) {
                    if (results[i] < previousValue) {
                        positiveGreenCandles++;
                    }
                } else {
                    break;
                }

                previousValue = results[i];
            }

            if (positiveGreenCandles > AWESOME_TREND_PERIODS) {
                this.trend = Trend.Positive;
                return Signal.Short;
            }
        }

        return Signal.None;
    }

    private previousAwesomeTrend(previousValues: number[]): Trend {
        let trend = 1;
        let i = previousValues.length - 1;
        let awesome = previousValues[i--];
        let newerValue = awesome;

        while (trend < AWESOME_TREND_PERIODS && i >= 0) {
            trend = 1;

            while (previousValues[i] < 0 && i >= 0) {
                /* Trending downwards if older value was greater than newer */
                if (previousValues[i] > newerValue) {
                    trend++;
                }

                newerValue = previousValues[i];
                i--;
            }

            if (trend >= AWESOME_TREND_PERIODS) {
                return Trend.Negative;
            }

            while (previousValues[i] > 0 && i >= 0) {
                /* Trending upwards if older value was less than newer */
                if (previousValues[i] < newerValue) {
                    trend++;
                }

                newerValue = previousValues[i];
                i--;
            }

            if (trend >= AWESOME_TREND_PERIODS) {
                return Trend.Positive;
            }
        }

        return awesome > 0 ? Trend.Positive : Trend.Negative;
    }
}
