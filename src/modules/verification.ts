/**
 * Verification module
 */

import type { APIClient } from '../client';
import type {
    VerificationResult,
    VerificationProof,
    VerifyReceiptOptions,
    VerifyCidOptions,
    VerificationChecks,
} from '../types/verification';

export const DEFAULT_FLARE_RPC = 'https://flare-api.flare.network/ext/C/rpc';
export const DEFAULT_ANCHOR_CONTRACT = '0x235f83a74fc9d759d648ec533d2c06712f3ca5ea';
export const EVIDENCE_ANCHORED_TOPIC0_PREFIX = '0xd414fe2d5071ea63';

export class VerificationModule {
    constructor(private client: APIClient) { }

    /**
     * Verify a receipt by checking its existence and performing on-chain cryptographic verification
     * of its evidence bundle hash against Flare network state via direct RPC (Chain 14).
     *
     * In accordance with Flare anchor verification rules, valid: true is permitted ONLY after
     * an RPC read of the transaction on chain 14 confirms the receipt status is successful
     * and the EvidenceAnchored event log contains the exact 32-byte bundle hash.
     * ProofRails /v1/iso/verify matches_onchain cannot make it valid without RPC confirmation.
     */
    async byReceiptId(receiptId: string, options?: VerifyReceiptOptions): Promise<VerificationResult> {
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

        if (!anchorTx) {
            errors.push('missing_anchor_transaction_hash');
            return {
                valid: false,
                bundleHash,
                onChain: false,
                anchorTx: '',
                timestamp: receipt.anchored_at || receipt.anchoredAt,
                checks,
                errors,
                details: {
                    receiptStatus: receipt.status,
                    receiptChain: receipt.chain,
                },
            };
        }

        // Query ProofRails /v1/iso/verify for backend metadata and reporting errors
        let apiVerifyResponse: any = null;
        try {
            apiVerifyResponse = await this.client.post<any>('/v1/iso/verify', {
                bundle_hash: bundleHash,
                bundle_url: receipt.bundle_url,
            });

            if (apiVerifyResponse?.errors && Array.isArray(apiVerifyResponse.errors)) {
                errors.push(...apiVerifyResponse.errors);
            }
        } catch {
            // Non-blocking: RPC read is the true authority on chain 14
        }

        // Independent RPC read on Flare mainnet (Chain 14)
        const rpcUrl = options?.rpcUrl || this.client.getFlareRpcUrl() || DEFAULT_FLARE_RPC;
        const targetContract = (options?.contractAddress || receipt.contract_address || DEFAULT_ANCHOR_CONTRACT).toLowerCase();

        try {
            const rpcResponse = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_getTransactionReceipt',
                    params: [anchorTx],
                }),
            });

            if (!rpcResponse.ok) {
                errors.push(`flare_rpc_http_error_${rpcResponse.status}`);
            } else {
                const rpcData = await rpcResponse.json();
                const txReceipt = rpcData?.result;

                if (!txReceipt) {
                    errors.push('anchor_tx_not_found_on_flare');
                } else {
                    const isStatusSuccess = txReceipt.status === '0x1' || txReceipt.status === 1 || txReceipt.status === true;
                    if (!isStatusSuccess) {
                        errors.push('anchor_tx_reverted_on_flare');
                    } else {
                        // Scan transaction logs for the EvidenceAnchored event
                        const logs: any[] = Array.isArray(txReceipt.logs) ? txReceipt.logs : [];
                        let matchingLogFound = false;

                        for (const log of logs) {
                            const logAddress = (log.address || '').toLowerCase();
                            const topic0 = (log.topics && log.topics[0] ? log.topics[0] : '').toLowerCase();

                            if (
                                (logAddress === targetContract || logAddress === DEFAULT_ANCHOR_CONTRACT.toLowerCase()) &&
                                topic0.startsWith(EVIDENCE_ANCHORED_TOPIC0_PREFIX)
                            ) {
                                // Extract first 32 bytes of log data
                                const rawData = typeof log.data === 'string'
                                    ? (log.data.startsWith('0x') ? log.data.slice(2) : log.data)
                                    : '';
                                const eventBundleHash = ('0x' + rawData.slice(0, 64)).toLowerCase();

                                if (eventBundleHash === bundleHash.toLowerCase()) {
                                    matchingLogFound = true;
                                    checks.onChainVerified = true;
                                    checks.transactionHashConfirmed = true;
                                    break;
                                }
                            }
                        }

                        if (!matchingLogFound) {
                            errors.push('anchor_log_hash_mismatch_on_flare');
                        }
                    }
                }
            }
        } catch (rpcErr: any) {
            errors.push(rpcErr.message || 'flare_rpc_read_failed');
        }

        // Validity requires:
        // 1. Receipt exists
        // 2. Status anchored
        // 3. Bundle hash present
        // 4. ON-CHAIN VERIFIED via direct RPC read (not solely relying on /v1/iso/verify)
        const isValid = checks.receiptExists && checks.statusAnchored && checks.bundleHashPresent && checks.onChainVerified;

        return {
            valid: isValid,
            bundleHash,
            onChain: checks.onChainVerified,
            anchorTx,
            timestamp: apiVerifyResponse?.anchored_at || receipt.anchored_at || receipt.anchoredAt,
            checks,
            errors: errors.length > 0 ? errors : undefined,
            details: {
                receiptStatus: receipt.status,
                receiptChain: receipt.chain,
                contractAddress: targetContract,
                apiMatchesOnchain: apiVerifyResponse?.matches_onchain,
                errors,
            },
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
