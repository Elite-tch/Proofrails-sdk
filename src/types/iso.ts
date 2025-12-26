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
    accountId?: string;
}

export interface Statement {
    type: 'camt.052' | 'camt.053';
    url: string;
    downloadUrl: string;
    messageId: string;
    createdAt: string;
}
