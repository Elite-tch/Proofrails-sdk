/** A payment proof accepted by ProofRails x402-protected endpoints. */
export interface X402Payment {
    txHash: string;
    amount: string;
    recipient: string;
    currency?: string;
    chain?: string;
}

export interface X402Price {
    path: string;
    price: string;
    currency: string;
    recipient: string;
}

export interface X402PaymentVerification {
    verified: boolean;
    paymentId?: string;
    txHash?: string;
    error?: string;
}
