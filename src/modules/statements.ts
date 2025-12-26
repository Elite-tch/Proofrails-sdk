/**
 * Statements module
 */

import type { APIClient } from '../client';
import type { GenerateStatementOptions, Statement } from '../types/iso';

export class StatementsModule {
    constructor(private client: APIClient) { }

    async intraday(options: GenerateStatementOptions = {}): Promise<Statement> {
        const response = await this.client.post<any>('/v1/iso/statement/camt052', {
            date_from: options.dateFrom,
            date_to: options.dateTo,
            account_id: options.accountId,
        });

        return {
            type: 'camt.052',
            url: response.url,
            downloadUrl: response.download_url || response.url,
            messageId: response.message_id || response.messageId,
            createdAt: response.created_at || new Date().toISOString(),
        };
    }

    async endOfDay(options: GenerateStatementOptions = {}): Promise<Statement> {
        const response = await this.client.post<any>('/v1/iso/statement/camt053', {
            date: options.dateTo || options.dateFrom,
            account_id: options.accountId,
        });

        return {
            type: 'camt.053',
            url: response.url,
            downloadUrl: response.download_url || response.url,
            messageId: response.message_id || response.messageId,
            createdAt: response.created_at || new Date().toISOString(),
        };
    }
}
