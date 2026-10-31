/**
 * x402 Protocol and Payment Types
 */

/** Legacy transaction-hash proof accepted by ProofRails endpoints in custom X-PAYMENT header. */
export interface X402Payment {
    txHash: string;
    amount: string;
    recipient: string;
    currency?: string;
    chain?: string;
}

export interface X402PaymentOption {
    scheme: string;
    network: string;
    amount: string;
    asset: string;
    payTo: string;
    maxTimeoutSeconds?: number;
    extra?: {
        name?: string;
        version?: string;
        facilitator?: string;
        settlementModes?: string[];
        authorizationTypes?: string[];
        eip712Domain?: Record<string, unknown>;
        eip712Types?: Record<string, unknown>;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface X402Challenge {
    x402Version: number;
    error?: string;
    resource?: { url?: string; description?: string; mimeType?: string; [key: string]: unknown };
    accepts: X402PaymentOption[];
    endpoint?: string;
}

export interface X402Authorization {
    from: string;
    to: string;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: string;
}

export interface X402PaymentSignaturePayload {
    x402Version: number;
    resource?: { url?: string; [key: string]: unknown };
    accepted: X402PaymentOption;
    payload: {
        authorization: X402Authorization;
        signature: string;
    };
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

export type X402Signer =
    | { address: string; signTypedData: (...args: any[]) => Promise<string> }
    | string;

export interface X402RequestOptions extends RequestInit {
    signer?: X402Signer;
    privateKey?: string;
}

export interface FXLookupOptions extends X402RequestOptions {
    baseCcy?: string;
    quoteCcy?: string;
    provider?: string;
}
