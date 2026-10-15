import type { APIClient } from '../client';
import type { ChainAnchor, TenantAnchorConfirmation, TenantAnchorResult } from '../types/verification';

/** Receipt anchor queries and tenant-mode anchor confirmation. */
export class AnchoringModule {
    constructor(private client: APIClient) { }

    async list(receiptId: string): Promise<ChainAnchor[]> {
        const response = await this.client.get<any[]>(`/v1/anchors/${receiptId}`);
        return response.map((anchor) => ({
            chain: anchor.chain,
            txid: anchor.txid,
            anchoredAt: anchor.anchored_at,
        }));
    }

    /** Confirm a transaction that your tenant submitted to its configured anchor contract. */
    async confirm(options: TenantAnchorConfirmation): Promise<TenantAnchorResult> {
        const response = await this.client.post<any>('/v1/iso/confirm-anchor', {
            receipt_id: options.receiptId,
            flare_txid: options.flareTxid,
            chain: options.chain,
        });
        return {
            receiptId: response.receipt_id,
            status: response.status,
            flareTxid: response.flare_txid,
            anchoredAt: response.anchored_at,
        };
    }
}
