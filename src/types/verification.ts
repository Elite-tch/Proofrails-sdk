/**
 * Verification related types
 */

export interface VerificationChecks {
    /** True if receipt record exists */
    receiptExists: boolean;
    /** True if receipt record indicates anchored state */
    statusAnchored: boolean;
    /** True if bundle hash is present and valid hexadecimal */
    bundleHashPresent: boolean;
    /** True if cryptographic bundle hash was verified against the smart contract on Flare via direct RPC */
    onChainVerified: boolean;
    /** True if on-chain transaction ID and event hash match the recorded anchor transaction */
    transactionHashConfirmed?: boolean;
}

export interface VerificationResult {
    /** Overall verification validity (requires on-chain verification confirmation via Flare RPC) */
    valid: boolean;
    bundleHash: string;
    onChain: boolean;
    anchorTx?: string;
    blockNumber?: number;
    timestamp?: string;
    signature?: string;
    checks?: VerificationChecks;
    errors?: string[];
    details?: Record<string, unknown>;
}

export interface VerificationProof {
    receiptId: string;
    bundleHash: string;
    anchorTx: string;
    blockNumber: number;
    timestamp: string;
    signature: string;
    network: string;
    contractAddress: string;
}

export interface VerifyReceiptOptions {
    /** Optional RPC URL override for reading transaction receipts on Flare */
    rpcUrl?: string;
    /** Optional EvidenceAnchor contract address override */
    contractAddress?: string;
}

export interface VerifyCidOptions {
    cid: string;
    store?: 'ipfs' | 'arweave' | 'auto';
    receiptId?: string;
}

export interface ChainAnchor {
    chain: string;
    txid: string;
    anchoredAt?: string | null;
}

export interface TenantAnchorConfirmation {
    receiptId: string;
    flareTxid: string;
    chain?: string;
}

export interface TenantAnchorResult {
    receiptId: string;
    status: string;
    flareTxid?: string | null;
    anchoredAt?: string | null;
}
