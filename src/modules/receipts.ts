/**
 * Receipt operations module
 */

import type { APIClient } from '../client';
import type {
    CreateReceiptOptions,
    Receipt,
    ReceiptArtifacts,
    ListReceiptsOptions,
} from '../types/receipt';
import type { PaginatedResponse } from '../types/common';
import type { ISOMessage } from '../types/iso';

export class ReceiptsModule {
    constructor(private client: APIClient) { }

    async create(options: CreateReceiptOptions): Promise<Receipt> {
        const payload = {
            tip_tx_hash: options.transactionHash,
            chain: options.chain,
            amount: String(options.amount),
            currency: options.currency,
            sender_wallet: options.sender,
            receiver_wallet: options.receiver,
            reference: options.reference,
            callback_url: options.callbackUrl,
        };

        const response = await this.client.post<{ receipt_id: string; status: string }>(
            '/v1/iso/record-tip',
            payload
        );

        return {
            id: response.receipt_id,
            status: response.status as any,
            transactionHash: options.transactionHash,
            chain: options.chain,
            amount: String(options.amount),
            currency: options.currency,
            sender: options.sender,
            receiver: options.receiver,
            reference: options.reference,
            createdAt: new Date().toISOString(),
        };
    }

    async get(receiptId: string): Promise<Receipt> {
        return this.client.get<Receipt>(`/v1/iso/receipts/${receiptId}`);
    }

    async list(options: ListReceiptsOptions = {}): Promise<PaginatedResponse<Receipt>> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', String(options.limit));
        if (options.page) params.append('page', String(options.page));
        if (options.status) params.append('status', options.status);

        const query = params.toString();
        const endpoint = `/v1/iso/receipts${query ? `?${query}` : ''}`;

        // Check if response is array (direct list) or object (paginated)
        const response: any = await this.client.get(endpoint);
        const items = Array.isArray(response) ? response : (response.items || []);

        return {
            items: items,
            total: items.length,
            page: options.page || 1,
            limit: options.limit || 10,
        };
    }

    async getArtifacts(receiptId: string): Promise<ReceiptArtifacts> {
        const messages = await this.client.get<ISOMessage[]>(`/v1/iso/messages/${receiptId}`);
        const baseUrl = this.client.getBaseUrl();

        const artifacts: ReceiptArtifacts = {};

        messages.forEach((msg) => {
            switch (msg.type) {
                case 'pain.001':
                    artifacts.pain001Url = msg.url;
                    break;
                case 'pain.002':
                    artifacts.pain002Url = msg.url;
                    break;
                case 'pain.007':
                    artifacts.pain007Url = msg.url;
                    break;
                case 'pain.008':
                    artifacts.pain008Url = msg.url;
                    break;
                case 'camt.054':
                    artifacts.camt054Url = msg.url;
                    break;
            }
        });

        artifacts.bundleUrl = `${baseUrl}/files/${receiptId}/evidence.zip`;
        artifacts.manifestUrl = `${baseUrl}/files/${receiptId}/manifest.json`;

        return artifacts;
    }
}
