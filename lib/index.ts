import ccxt from 'ccxt';

import { pairs, LOOP_INTERVALS } from './Constants.js';
import { PairInfo, Exchange, Period, Signal } from './Types.js';
import {
    sleep,
    formatOHLCV,
} from './Utilities.js';
import { RSI } from './RSI.js';
import { AwesomeOscillator } from './AwesomeOscillator.js';

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

function processSignal(signal: Signal, pair: PairInfo, period: Period, indicator: string) {
    if (signal === Signal.None) {
        return;
    }

    if (signal === Signal.Long) {
        console.log(`ALERT: ${indicator} Enter long signal on ${period}, ${pair.label}`);
        return;
    }

    if (signal === Signal.Short) {
        console.log(`ALERT: ${indicator} Enter short signal on ${period}, ${pair.label}`);
        return;
    }
}

async function watchMarket(exchange: any, market: any, pair: PairInfo, period: Period, loadingComplete: () => void) {
    const sleepInterval = LOOP_INTERVALS[period];

    let ohlcv = await getOHLCV(exchange, pair.symbol, period);

    let price = await exchange.fetchTicker(market.id);

    const rsi = new RSI(ohlcv.closes, price.last);

    const awesome = new AwesomeOscillator(
        ohlcv.highs,
        ohlcv.lows,
    );

    console.log(`Loaded ${pair.label} ${period}, RSI trend: ${rsi.trend}, Awesome Trend: ${awesome.trend}`);

    loadingComplete();

    while (true) {
        await sleep(sleepInterval);

        price = await exchange.fetchTicker(market.id);
        ohlcv = await getOHLCV(exchange, pair.symbol, period);

        const rsiSignal = rsi.processNewData(ohlcv.closes, price.last);
        const awesomeSignal = awesome.processNewData(ohlcv.highs, ohlcv.lows);

        processSignal(rsiSignal, pair, period, 'RSI');
        processSignal(awesomeSignal, pair, period, 'AO');
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
