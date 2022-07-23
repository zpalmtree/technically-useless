export enum Signal {
    None = 0,
    Short,
    Long,
}

export enum Trend {
    Positive = 'Positive',
    Negative = 'Negative',
}

export enum Exchange {
    Phemex = 'phemex',
}

export enum Period {
    FourHour = '4h',
    EightHour = '8h',
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
