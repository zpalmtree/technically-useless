import { Period, PairInfo, Exchange } from './Types.js';

export const pairs: PairInfo[] = [
    {
        symbol: 'BTC/USD:USD',
        label: 'BTC',
        exchange: Exchange.Phemex,
    },
    {
        symbol: 'ETH/USD:USD',
        label: 'ETH',
        exchange: Exchange.Phemex,
    },
    {
        symbol: 'SOL/USD:USD',
        label: 'SOL',
        exchange: Exchange.Phemex,
    },
];

export const LOOP_INTERVALS = {
    [Period.FourHour]: 1000 * 60 * 1,
    [Period.TwelveHour]: 1000 * 60 * 10,
    [Period.OneDay]: 1000 * 60 * 15,
};

export const RSI_DISTANCE_INDICATOR = 4;
