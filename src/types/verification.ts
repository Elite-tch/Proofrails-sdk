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
