/**
 * Verification module
 */

import type { APIClient } from '../client';
import type { VerificationResult, VerificationProof, VerifyCidOptions } from '../types/verification';

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
        const response = await this.client.post<any>('/v1/iso/verify', {
            bundle_url: bundleUrl,
        });
        return this.toResult(response);
    }

    async byHash(bundleHash: string): Promise<VerificationResult> {
        const response = await this.client.post<any>('/v1/iso/verify', {
            bundle_hash: bundleHash,
        });
        return this.toResult(response);
    }

    /** Verify an evidence bundle stored on IPFS or Arweave. */
    async byCid(options: VerifyCidOptions): Promise<VerificationResult> {
        const response = await this.client.post<any>('/v1/iso/verify-cid', {
            cid: options.cid,
            store: options.store || 'auto',
            receipt_id: options.receiptId,
        });
        return this.toResult(response);
    }

    async getProof(receiptId: string): Promise<VerificationProof> {
        const receipt = await this.client.get<any>(`/v1/iso/receipts/${receiptId}`);

        return {
            receiptId,
            bundleHash: receipt.bundle_hash || receipt.bundleHash,
            anchorTx: receipt.flare_txid || receipt.anchor_tx || receipt.anchorTx,
            blockNumber: receipt.block_number || 0,
            timestamp: receipt.anchored_at || receipt.anchoredAt,
            signature: receipt.signature || '',
            network: receipt.chain,
            contractAddress: receipt.contract_address || '',
        };
    }

    private toResult(response: any): VerificationResult {
        return {
            valid: response.matches_onchain === true,
            bundleHash: response.bundle_hash || '',
            onChain: response.matches_onchain === true,
            anchorTx: response.flare_txid,
            timestamp: response.anchored_at,
            details: {
                errors: response.errors || [],
                vcPresent: response.vc_present,
                vcUrl: response.vc_url,
                arweaveTxid: response.arweave_txid,
                issuer: response.issuer,
                checksums: response.checksums,
            },
        };
    }
}
