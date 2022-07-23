import ccxt from 'ccxt';
import { RSI } from 'technicalindicators';

import { pairs, LOOP_INTERVALS, RSI_DISTANCE_INDICATOR } from './Constants.js';
import { PairInfo, Exchange, Period, Level } from './Types.js';
import {
    sleep,
    formatOHLCV,
    previousImportantRSILevel,
} from './Utilities.js';

async function init(pairs: PairInfo[]) {
    const phemex = new ccxt.phemex();

    const exchanges = {
        [Exchange.Phemex]: phemex,
    };

    const watchedMarkets = [];

    for (const pair of pairs) {
        const exchange = exchanges[pair.exchange];

        await exchange.loadMarkets();

        const m = exchange.market(pair.symbol);

        if (!m) {
            throw new Error(`Exchange ${exchange.id} appears to not have a market for pair ${pair.symbol}!`);
        }

        watchedMarkets.push({ market: m, pair: pair });
    }


    return {
        exchanges,
        markets: watchedMarkets,
    };
}

async function getOHLCV(exchange: any, symbol: string, period: string) {
    const candles = await exchange.fetchOHLCV(symbol, period, undefined, 100);
    const ohlcv = formatOHLCV(candles);
    return ohlcv;
}

async function watchMarket(exchange: any, market: any, pair: PairInfo, period: Period, loadingComplete: () => void) {
    const sleepInterval = LOOP_INTERVALS[period];

    let ohlcv = await getOHLCV(exchange, pair.symbol, period);

    let rsiData = new RSI({
        values: ohlcv.closes,
        period: 14,
    });

    let price = await exchange.fetchTicker(market.id);

    let previousRSI = rsiData.nextValue(price.last)!;
    let previousImportantLevel = previousImportantRSILevel([...rsiData.getResult(), previousRSI]);

    console.log(`Loaded ${pair.label} ${period}, price: $${price.last}, RSI trend: ${previousImportantLevel === Level.Positive ? 'Positive' : 'Negative'}`);

    loadingComplete();

    while (true) {
        await sleep(sleepInterval);

        price = await exchange.fetchTicker(market.id);
        ohlcv = await getOHLCV(exchange, pair.symbol, period);

        rsiData = new RSI({
            values: ohlcv.closes,
            period: 14,
        });

        const rsi = rsiData.nextValue(price.last);
        let newLevel = previousImportantLevel;

        if (rsi) {
            if (previousRSI > 50 && rsi < 50) {
                console.log(`ALERT: RSI flipped negative on ${period}, ${pair.label}`);
            }

            if (previousRSI < 50 && rsi > 50) {
                console.log(`ALERT: RSI flipped positive on ${period}, ${pair.label}`);
            }

            if (rsi >= (50 + RSI_DISTANCE_INDICATOR) && previousImportantLevel === Level.Negative) {
                console.log(`ALERT: Enter long signal on ${period}, ${pair.label}`);
                newLevel = Level.Positive;
            }

            if (rsi <= (50 - RSI_DISTANCE_INDICATOR) && previousImportantLevel === Level.Positive) {
                console.log(`ALERT: Enter short signal on ${period}, ${pair.label}`);
                newLevel = Level.Negative;
            }

            previousRSI = rsi;
            previousImportantLevel = newLevel;
        }
    }
}

async function main() {
    const {
        markets,
        exchanges,
    } = await init(pairs);

    for (const { market, pair } of markets) {
        const exchange = exchanges[pair.exchange];

        const periods = [
            Period.FourHour,
            Period.TwelveHour,
            Period.OneDay,
        ];

        for (const period of periods) {
            await new Promise<void>((resolve, reject) => {
                watchMarket(exchange, market, pair, period, resolve);
            });
        }

        console.log('');
    }
}

main();
