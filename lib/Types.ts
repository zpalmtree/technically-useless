export enum Level {
    Positive,
    Negative,
}

export enum Exchange {
    Phemex = 'phemex',
}

export enum Period {
    FourHour = '4h',
    TwelveHour = '12h',
    OneDay = '1d',
}

export interface PairInfo {
    symbol: string;

    label: string;

    exchange: Exchange;
}

export interface OHLCV {
    opens: number[];

    highs: number[];

    lows: number[];

    closes: number[];

    volumes: number[];
}
