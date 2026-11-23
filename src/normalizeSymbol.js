const BLANK = '□';

export  default function normalizeSymbol(symbol) {
    return symbol === `&#9633;` || symbol === '□'
        ? BLANK
        : symbol;
};