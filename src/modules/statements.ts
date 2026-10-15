/**
 * Statements module
 */

import type { APIClient } from '../client';
import type { GenerateStatementOptions, Statement } from '../types/iso';

export class StatementsModule {
    constructor(private client: APIClient) { }

    async intraday(options: GenerateStatementOptions = {}): Promise<Statement> {
        const date = options.dateTo || options.dateFrom;
        if (!date) throw new Error('A date is required to generate a camt.052 statement');
        const response = await this.generate(date, options.window || '09:00-17:00', options.xPayment);

        return {
            type: 'camt.052',
            xml: response.xml,
            count: response.count,
        };
    }

    async endOfDay(options: GenerateStatementOptions = {}): Promise<Statement> {
        const date = options.dateTo || options.dateFrom;
        if (!date) throw new Error('A date is required to generate a camt.053 statement');
        const response = await this.generate(date, undefined, options.xPayment);

        return {
            type: 'camt.053',
            xml: response.xml,
            count: response.count,
        };
    }

    private generate(date: string, window?: string, xPayment?: string): Promise<any> {
        if (!xPayment) {
            throw new Error('xPayment is required: statements are x402 premium middleware operations');
        }
        return this.client.post('/v1/x402/premium/generate-statement', { date, window }, {
            headers: { 'X-PAYMENT': xPayment },
        });
    }
}
