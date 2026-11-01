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

/** Normalize a hex string to always have the 0x prefix. */
function ensureHexPrefix(value: string): string {
    if (!value) return value;
    return value.startsWith('0x') ? value : '0x' + value;
}

export interface OnChainVerifyResult {
    onChainVerified: boolean;
    transactionHashConfirmed: boolean;
    errors: string[];
}

/**
 * Shared helper: independently verify an anchor transaction on Flare (Chain 14) via JSON-RPC.
 *
 * Given a flare_txid and the expected bundle_hash, this:
 *   1. Calls eth_getTransactionReceipt on the Flare RPC.
 *   2. Confirms the tx status is 0x1 (success).
 *   3. Scans EvidenceAnchored logs from the anchor contract.
 *   4. Checks the first 32 bytes of log data match the expected bundle hash.
 *
 * Returns { onChainVerified, transactionHashConfirmed, errors }.
 * Does NOT trust any ProofRails API response for this decision.
 */
export async function verifyAnchorTxOnChain(
    anchorTx: string,
    expectedBundleHash: string,
    options?: VerifyReceiptOptions,
): Promise<OnChainVerifyResult> {
    const errors: string[] = [];

    // Normalize both inputs to ensure 0x prefix
    const normalizedAnchorTx = ensureHexPrefix(anchorTx);
    const normalizedBundleHash = ensureHexPrefix(expectedBundleHash).toLowerCase();

    const rpcUrl = options?.rpcUrl || DEFAULT_FLARE_RPC;
    const targetContract = (options?.contractAddress || DEFAULT_ANCHOR_CONTRACT).toLowerCase();

    try {
        const rpcResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionReceipt',
                params: [normalizedAnchorTx],
            }),
        });

        if (!rpcResponse.ok) {
            errors.push(`flare_rpc_http_error_${rpcResponse.status}`);
            return { onChainVerified: false, transactionHashConfirmed: false, errors };
        }

        const rpcData = await rpcResponse.json();
        const txReceipt = rpcData?.result;

        if (!txReceipt) {
            errors.push('anchor_tx_not_found_on_flare');
            return { onChainVerified: false, transactionHashConfirmed: false, errors };
        }

        const isStatusSuccess =
            txReceipt.status === '0x1' ||
            txReceipt.status === 1 ||
            txReceipt.status === true;

        if (!isStatusSuccess) {
            errors.push('anchor_tx_reverted_on_flare');
            return { onChainVerified: false, transactionHashConfirmed: false, errors };
        }

        // Scan logs for EvidenceAnchored event from the anchor contract
        const logs: any[] = Array.isArray(txReceipt.logs) ? txReceipt.logs : [];

        for (const log of logs) {
            const logAddress = (log.address || '').toLowerCase();
            const topic0 = (log.topics && log.topics[0] ? log.topics[0] : '').toLowerCase();

            if (
                (logAddress === targetContract || logAddress === DEFAULT_ANCHOR_CONTRACT.toLowerCase()) &&
                topic0.startsWith(EVIDENCE_ANCHORED_TOPIC0_PREFIX)
            ) {
                // Extract first 32 bytes of log data (the bundle hash)
                const rawData =
                    typeof log.data === 'string'
                        ? log.data.startsWith('0x')
                            ? log.data.slice(2)
                            : log.data
                        : '';
                const eventBundleHash = ('0x' + rawData.slice(0, 64)).toLowerCase();

                if (eventBundleHash === normalizedBundleHash) {
                    return {
                        onChainVerified: true,
                        transactionHashConfirmed: true,
                        errors: [],
                    };
                }
            }
        }

        errors.push('anchor_log_hash_mismatch_on_flare');
        return { onChainVerified: false, transactionHashConfirmed: false, errors };
    } catch (rpcErr: any) {
        errors.push(rpcErr?.message || 'flare_rpc_read_failed');
        return { onChainVerified: false, transactionHashConfirmed: false, errors };
    }
}

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

        // Normalize both values: API may return them without 0x prefix
        const bundleHash = ensureHexPrefix(receipt.bundle_hash || receipt.bundleHash || '');
        const anchorTx = ensureHexPrefix(
            receipt.flare_txid || receipt.anchor_tx || receipt.anchorTx || ''
        );

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

        if (!anchorTx || anchorTx === '0x') {
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

        // Query ProofRails /v1/iso/verify for backend metadata (non-authoritative)
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

        // Independent RPC read on Flare mainnet (Chain 14) — this is the authoritative check
        const rpcOptions: VerifyReceiptOptions = {
            rpcUrl: options?.rpcUrl || this.client.getFlareRpcUrl() || DEFAULT_FLARE_RPC,
            contractAddress: options?.contractAddress || receipt.contract_address || DEFAULT_ANCHOR_CONTRACT,
        };

        const onChainResult = await verifyAnchorTxOnChain(anchorTx, bundleHash, rpcOptions);

        checks.onChainVerified = onChainResult.onChainVerified;
        checks.transactionHashConfirmed = onChainResult.transactionHashConfirmed;
        errors.push(...onChainResult.errors);

        // Validity requires: receipt exists + status anchored + bundle hash + ON-CHAIN RPC confirmation
        const isValid =
            checks.receiptExists &&
            checks.statusAnchored &&
            checks.bundleHashPresent &&
            checks.onChainVerified;

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
                contractAddress: rpcOptions.contractAddress,
                apiMatchesOnchain: apiVerifyResponse?.matches_onchain,
                errors,
            },
        };
    }

    /**
     * Verify by bundle URL.
     * Calls /v1/iso/verify to get the bundle metadata (flare_txid + bundle_hash),
     * then independently verifies on Flare Chain 14 via RPC.
     * A fabricated matches_onchain: true from the backend is NOT trusted.
     */
    async byUrl(bundleUrl: string, options?: VerifyReceiptOptions): Promise<VerificationResult> {
        const response = await this.client.post<any>('/v1/iso/verify', {
            bundle_url: bundleUrl,
        });
        return this._verifyWithRpc(response, options);
    }

    /**
     * Verify by bundle hash.
     * Calls /v1/iso/verify to get the anchor transaction (flare_txid),
     * then independently verifies on Flare Chain 14 via RPC.
     * A fabricated matches_onchain: true from the backend is NOT trusted.
     */
    async byHash(bundleHash: string, options?: VerifyReceiptOptions): Promise<VerificationResult> {
        const response = await this.client.post<any>('/v1/iso/verify', {
            bundle_hash: bundleHash,
        });
        return this._verifyWithRpc(response, options);
    }

    /** Verify an evidence bundle stored on IPFS or Arweave. */
    async byCid(options: VerifyCidOptions): Promise<VerificationResult> {
        const response = await this.client.post<any>('/v1/iso/verify-cid', {
            cid: options.cid,
            store: options.store || 'auto',
            receipt_id: options.receiptId,
        });
        return this._verifyWithRpc(response, undefined);
    }

    async getProof(receiptId: string): Promise<VerificationProof> {
        const receipt = await this.client.get<any>(`/v1/iso/receipts/${receiptId}`);

        return {
            receiptId,
            bundleHash: ensureHexPrefix(receipt.bundle_hash || receipt.bundleHash || ''),
            anchorTx: ensureHexPrefix(
                receipt.flare_txid || receipt.anchor_tx || receipt.anchorTx || ''
            ),
            blockNumber: receipt.block_number || 0,
            timestamp: receipt.anchored_at || receipt.anchoredAt,
            signature: receipt.signature || '',
            network: receipt.chain,
            contractAddress: receipt.contract_address || '',
        };
    }

    /**
     * Internal: given a /v1/iso/verify API response, extract flare_txid + bundle_hash
     * and independently verify on-chain via Flare RPC.
     * The backend's matches_onchain field is recorded for transparency but is NOT used
     * to determine valid: true.
     */
    private async _verifyWithRpc(
        response: any,
        options?: VerifyReceiptOptions,
    ): Promise<VerificationResult> {
        // Normalize both values from the API response
        const bundleHash = ensureHexPrefix(response.bundle_hash || '');
        const anchorTx = ensureHexPrefix(
            response.flare_txid || response.anchor_tx || response.anchorTx || ''
        );

        const errors: string[] = [];

        if (response.errors && Array.isArray(response.errors)) {
            errors.push(...response.errors);
        }

        const checks: VerificationChecks = {
            receiptExists: true,
            statusAnchored: response.matches_onchain === true || response.status === 'anchored',
            bundleHashPresent: !!bundleHash && bundleHash.length > 2,
            onChainVerified: false,
            transactionHashConfirmed: false,
        };

        // If the API returned no anchor tx, we cannot verify on-chain
        if (!anchorTx || anchorTx === '0x') {
            errors.push('missing_anchor_transaction_hash');
            return {
                valid: false,
                bundleHash,
                onChain: false,
                anchorTx: '',
                timestamp: response.anchored_at,
                checks,
                errors: errors.length > 0 ? errors : undefined,
                details: {
                    apiMatchesOnchain: response.matches_onchain,
                    errors,
                    vcPresent: response.vc_present,
                    vcUrl: response.vc_url,
                    arweaveTxid: response.arweave_txid,
                    issuer: response.issuer,
                    checksums: response.checksums,
                },
            };
        }

        if (!bundleHash || bundleHash.length <= 2) {
            errors.push('missing_bundle_hash');
            return {
                valid: false,
                bundleHash,
                onChain: false,
                anchorTx,
                timestamp: response.anchored_at,
                checks,
                errors: errors.length > 0 ? errors : undefined,
                details: {
                    apiMatchesOnchain: response.matches_onchain,
                    errors,
                },
            };
        }

        // Independent RPC verification on Flare Chain 14
        const rpcOptions: VerifyReceiptOptions = {
            rpcUrl: options?.rpcUrl || this.client.getFlareRpcUrl() || DEFAULT_FLARE_RPC,
            contractAddress: options?.contractAddress || DEFAULT_ANCHOR_CONTRACT,
        };

        const onChainResult = await verifyAnchorTxOnChain(anchorTx, bundleHash, rpcOptions);

        checks.onChainVerified = onChainResult.onChainVerified;
        checks.transactionHashConfirmed = onChainResult.transactionHashConfirmed;
        errors.push(...onChainResult.errors);

        const isValid = checks.bundleHashPresent && checks.onChainVerified;

        return {
            valid: isValid,
            bundleHash,
            onChain: checks.onChainVerified,
            anchorTx,
            timestamp: response.anchored_at,
            checks,
            errors: errors.length > 0 ? errors : undefined,
            details: {
                apiMatchesOnchain: response.matches_onchain,
                errors,
                vcPresent: response.vc_present,
                vcUrl: response.vc_url,
                arweaveTxid: response.arweave_txid,
                issuer: response.issuer,
                checksums: response.checksums,
            },
        };
    }
}
