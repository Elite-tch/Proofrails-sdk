/**
 * ISO 20022 message types supported by ProofRails
 */

export type ISOMessageType =
    | 'pain.001'
    | 'pain.002'
    | 'pain.007'
    | 'pain.008'
    | 'pain.013'
    | 'pain.014'
    | 'pacs.002'
    | 'pacs.004'
    | 'pacs.008'
    | 'pacs.009'
    | 'pacs.028'
    | 'camt.029'
    | 'camt.052'
    | 'camt.053'
    | 'camt.054'
    | 'camt.056'
    | (string & {});

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
    /** Payment JSON used by the middleware's premium statement endpoint. */
    xPayment?: string;
}

export interface Statement {
    type: 'camt.052' | 'camt.053';
    url?: string;
    downloadUrl?: string;
    messageId?: string;
    createdAt?: string;
    /** Premium statement endpoints may return XML inline. */
    xml?: string;
    count?: number;
}
