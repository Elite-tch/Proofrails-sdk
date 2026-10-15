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
            metadata: options.metadata,
            tags: options.tags,
        };

        const response = await this.client.post<{ receipt_id: string; status: string; operation_id?: string }>(
            '/v1/iso/record-tip', payload,
            options.idempotencyKey ? { headers: { 'Idempotency-Key': options.idempotencyKey } } : {}
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
            operationId: response.operation_id || response.receipt_id,
        };
    }

    async get(receiptId: string): Promise<Receipt> {
        const response = await this.client.get<any>(`/v1/iso/receipts/${receiptId}`);
        return {
            id: response.id,
            status: response.status,
            transactionHash: response.tip_tx_hash || response.transactionHash,
            chain: response.chain,
            amount: response.amount,
            currency: response.currency,
            sender: response.sender_wallet || response.sender,
            receiver: response.receiver_wallet || response.receiver,
            reference: response.reference,
            createdAt: response.created_at || response.createdAt,
            anchoredAt: response.anchored_at || response.anchoredAt,
            anchorTx: response.flare_txid || response.anchorTx,
            bundleHash: response.bundle_hash || response.bundleHash,
            bundleUrl: response.bundle_url,
            xmlUrl: response.xml_url,
            projectId: response.project_id
        };
    }

    async list(options: ListReceiptsOptions = {}): Promise<PaginatedResponse<Receipt>> {
        const params = new URLSearchParams();
        if (options.page) params.append('page', String(options.page));
        params.append('page_size', String(options.pageSize || options.limit || 20));
        if (options.status) params.append('status', options.status);
        if (options.chain) params.append('chain', options.chain);
        if (options.reference) params.append('reference', options.reference);
        if (options.since) params.append('since', options.since);
        if (options.until) params.append('until', options.until);
        if (options.tags?.length) params.append('tags', options.tags.join(','));
        if (options.scope) params.append('scope', options.scope);
        if (options.cursor) params.append('cursor', options.cursor);

        const query = params.toString();
        const endpoint = `/v1/receipts${query ? `?${query}` : ''}`;

        // Check if response is array (direct list) or object (paginated)
        const response: any = await this.client.get(endpoint);
        const items = Array.isArray(response) ? response : (response.items || []);

        return {
            items: items.map((item: any) => this.toReceipt(item)),
            total: Array.isArray(response) ? items.length : response.total,
            page: Array.isArray(response) ? (options.page || 1) : response.page,
            limit: Array.isArray(response) ? (options.limit || 20) : response.page_size,
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

        const receipt = await this.client.get<any>(`/v1/iso/receipts/${receiptId}`);
        artifacts.bundleUrl = receipt.bundle_url || `${baseUrl}/files/${receiptId}/evidence.zip`;
        artifacts.manifestUrl = `${baseUrl}/files/${receiptId}/manifest.json`;

        return artifacts;
    }

    /** Poll the lightweight status endpoint while a receipt is processing. */
    async getStatus(receiptId: string): Promise<Pick<Receipt, 'id' | 'status' | 'bundleHash' | 'anchorTx' | 'anchoredAt'>> {
        const response = await this.client.get<any>(`/v1/iso/receipts/${receiptId}/status`);
        return { id: response.id, status: response.status, bundleHash: response.bundle_hash, anchorTx: response.flare_txid, anchoredAt: response.anchored_at };
    }

    /** Re-queue a failed receipt for platform anchoring. */
    async retryAnchor(receiptId: string): Promise<{ id: string; status: Receipt['status'] }> {
        return this.client.post(`/v1/iso/receipts/${receiptId}/retry-anchor`);
    }

    private toReceipt(response: any): Receipt {
        return {
            id: response.id,
            status: response.status,
            transactionHash: response.tip_tx_hash || response.transactionHash || '',
            chain: response.chain,
            amount: String(response.amount),
            currency: response.currency,
            sender: response.sender_wallet || response.sender || '',
            receiver: response.receiver_wallet || response.receiver || '',
            reference: response.reference,
            createdAt: response.created_at || response.createdAt,
            anchoredAt: response.anchored_at || response.anchoredAt,
            anchorTx: response.flare_txid || response.anchorTx,
            bundleHash: response.bundle_hash || response.bundleHash,
            metadata: response.metadata,
            tags: response.tags,
        };
    }
}
