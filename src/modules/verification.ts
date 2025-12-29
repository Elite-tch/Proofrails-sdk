/**
 * Verification module
 */

import type { APIClient } from '../client';
import type { VerificationResult, VerificationProof } from '../types/verification';

export class VerificationModule {
    constructor(private client: APIClient) { }

    async byReceiptId(receiptId: string): Promise<VerificationResult> {
        const receipt = await this.client.get<any>(`/v1/iso/receipts/${receiptId}`);

        return {
            valid: receipt.status === 'anchored',
            bundleHash: receipt.bundle_hash || receipt.bundleHash || '',
            onChain: !!(receipt.flare_txid || receipt.anchor_tx || receipt.anchorTx),
            anchorTx: receipt.flare_txid || receipt.anchor_tx || receipt.anchorTx,
            timestamp: receipt.anchored_at || receipt.anchoredAt,
        };
    }

    async byUrl(bundleUrl: string): Promise<VerificationResult> {
        return this.client.post<VerificationResult>('/v1/iso/verify', {
            bundle_url: bundleUrl,
        });
    }

    async byHash(bundleHash: string): Promise<VerificationResult> {
        return this.client.post<VerificationResult>('/v1/iso/verify', {
            bundle_hash: bundleHash,
        });
    }

    async getProof(receiptId: string): Promise<VerificationProof> {
        const receipt = await this.client.get<any>(`/v1/iso/receipts/${receiptId}`);

        return {
            receiptId,
            bundleHash: receipt.bundle_hash || receipt.bundleHash,
            anchorTx: receipt.anchor_tx || receipt.anchorTx,
            blockNumber: receipt.block_number || 0,
            timestamp: receipt.anchored_at || receipt.anchoredAt,
            signature: receipt.signature || '',
            network: receipt.chain,
            contractAddress: receipt.contract_address || '',
        };
    }
}
