/**
 * Verification related types
 */

export interface VerificationResult {
    valid: boolean;
    bundleHash: string;
    onChain: boolean;
    anchorTx?: string;
    blockNumber?: number;
    timestamp?: string;
    signature?: string;
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
