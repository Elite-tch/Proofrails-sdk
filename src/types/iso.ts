/**
 * ISO 20022 message types
 */

export type ISOMessageType =
    | 'pain.001'
    | 'pain.002'
    | 'pain.007'
    | 'pain.008'
    | 'camt.052'
    | 'camt.053'
    | 'camt.054';

export interface ISOMessage {
    type: ISOMessageType;
    messageId: string;
    url: string;
    createdAt: string;
}

export interface GenerateStatementOptions {
    dateFrom?: string;
    dateTo?: string;
    /** A narrower time range creates an intraday camt.052 statement. */
    window?: string;
    /** x402 payment JSON used by the middleware's premium statement endpoint. */
    xPayment?: string;
}

export interface Statement {
    type: 'camt.052' | 'camt.053';
    url?: string;
    downloadUrl?: string;
    messageId?: string;
    createdAt?: string;
    /** Current premium endpoint returns XML inline. */
    xml?: string;
    count?: number;
}
