/**
 * Verification module
 */

import type { APIClient } from '../client';
import type { VerificationResult, VerificationProof, VerifyCidOptions, VerificationChecks } from '../types/verification';

export class VerificationModule {
    constructor(private client: APIClient) { }

    /**
     * Verify a receipt by checking its existence and performing on-chain cryptographic verification
     * of its evidence bundle hash against Flare network state.
     */
    async byReceiptId(receiptId: string): Promise<VerificationResult> {
        const receipt = await this.client.get<any>(`/v1/iso/receipts/${receiptId}`);
        const bundleHash = receipt.bundle_hash || receipt.bundleHash || '';
        const anchorTx = receipt.flare_txid || receipt.anchor_tx || receipt.anchorTx || '';

        const checks: VerificationChecks = {
            receiptExists: !!receipt && !!(receipt.id || receipt.receipt_id),
            statusAnchored: receipt.status === 'anchored',
            bundleHashPresent: !!bundleHash && bundleHash.startsWith('0x') && bundleHash.length > 2,
            onChainVerified: false,
            transactionHashConfirmed: false,
        };

        const errors: string[] = [];

        if (!checks.bundleHashPresent) {
            errors.push('missing_bundle_hash');
            return {
                valid: false,
                bundleHash,
                onChain: false,
                anchorTx,
                timestamp: receipt.anchored_at || receipt.anchoredAt,
                checks,
                errors,
                details: {
                    receiptStatus: receipt.status,
                    receiptChain: receipt.chain,
                },
            };
        }

        // Perform independent cryptographic verification against the on-chain registry
        try {
            const verifyResponse = await this.client.post<any>('/v1/iso/verify', {
                bundle_hash: bundleHash,
                bundle_url: receipt.bundle_url,
            });

            const onChainMatched = verifyResponse.matches_onchain === true;
            checks.onChainVerified = onChainMatched;

            if (verifyResponse.errors && Array.isArray(verifyResponse.errors)) {
                errors.push(...verifyResponse.errors);
            }

            const verifiedTxid = verifyResponse.flare_txid || anchorTx;
            if (anchorTx && verifyResponse.flare_txid) {
                checks.transactionHashConfirmed = anchorTx.toLowerCase() === verifyResponse.flare_txid.toLowerCase();
            } else if (verifiedTxid) {
                checks.transactionHashConfirmed = true;
            }

            const isValid = checks.receiptExists && checks.statusAnchored && checks.bundleHashPresent && checks.onChainVerified;

            return {
                valid: isValid,
                bundleHash: verifyResponse.bundle_hash || bundleHash,
                onChain: onChainMatched,
                anchorTx: verifiedTxid,
                timestamp: verifyResponse.anchored_at || receipt.anchored_at || receipt.anchoredAt,
                checks,
                errors: errors.length > 0 ? errors : undefined,
                details: {
                    receiptStatus: receipt.status,
                    receiptChain: receipt.chain,
                    contractAddress: receipt.contract_address,
                    errors: verifyResponse.errors || [],
                },
            };
        } catch (err: any) {
            errors.push(err.message || 'verification_request_failed');
            return {
                valid: false,
                bundleHash,
                onChain: false,
                anchorTx,
                timestamp: receipt.anchored_at || receipt.anchoredAt,
                checks,
                errors,
                details: {
                    receiptStatus: receipt.status,
                    receiptChain: receipt.chain,
                },
            };
        }
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
        const onChain = response.matches_onchain === true;
        const bundleHash = response.bundle_hash || '';
        const checks: VerificationChecks = {
            receiptExists: true,
            statusAnchored: onChain,
            bundleHashPresent: !!bundleHash,
            onChainVerified: onChain,
            transactionHashConfirmed: !!response.flare_txid,
        };

        return {
            valid: onChain,
            bundleHash,
            onChain,
            anchorTx: response.flare_txid,
            timestamp: response.anchored_at,
            checks,
            errors: response.errors && response.errors.length > 0 ? response.errors : undefined,
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
