import { privateKeyToAccount } from 'viem/accounts';
import type { APIClient } from '../client';
import { ProofRailsError } from '../types/common';
import type {
    X402Payment,
    X402Price,
    X402PaymentVerification,
    X402Challenge,
    X402PaymentOption,
    X402PaymentSignaturePayload,
    X402Signer,
    X402RequestOptions,
    FXLookupOptions,
} from '../types/x402';

export const DEFAULT_FLARE_USDT0_ASSET = '0xe7cd86e13AC4309349F30B3435a9d337750fC82D';
export const DEFAULT_FLARE_USDT0_RECIPIENT = '0x0A617D605a1010a74B8dA756E48D75bCef110ef4';
export const DEFAULT_FLARE_CHAIN_ID = 14;

/**
 * x402 Module
 *
 * Implements the official x402 v2 challenge-response client protocol (EIP-3009 TransferWithAuthorization)
 * for payment-gated endpoints, alongside legacy transaction-proof header helpers.
 */
export class X402Module {
    constructor(private client: APIClient) { }

    /** Get pricing for all protected endpoints. */
    async pricing(): Promise<X402Price[]> {
        return this.client.get('/v1/x402/pricing');
    }

    /** Update endpoint pricing (admin only). */
    async updatePricing(prices: X402Price[]): Promise<Record<string, unknown>> {
        return this.client.post('/v1/x402/pricing', prices);
    }

    /** Query payment logs. */
    async payments(options: {
        limit?: number;
        offset?: number;
        currency?: string;
        chain?: string;
        status?: string;
        paymentType?: string;
    } = {}): Promise<Record<string, unknown>> {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries({
            limit: options.limit,
            offset: options.offset,
            currency: options.currency,
            chain: options.chain,
            status: options.status,
            payment_type: options.paymentType,
        })) {
            if (value !== undefined) query.set(key, String(value));
        }
        const queryString = query.toString();
        return this.client.get(`/v1/x402/payments${queryString ? `?${queryString}` : ''}`);
    }

    /** Get revenue metrics for payments. */
    async revenue(days = 7): Promise<Record<string, unknown>> {
        return this.client.get(`/v1/x402/revenue?days=${days}`);
    }

    /** Retrieve facilitator configuration. */
    async facilitatorConfig(): Promise<Record<string, unknown>> {
        return this.client.get('/v1/x402/facilitator-config');
    }

    // ── x402 V2 Client Implementation ────────────────────────────────────────

    /**
     * Decode a base64 PAYMENT-REQUIRED challenge header into an X402Challenge object.
     */
    decodePaymentRequiredHeader(headerValue: string): X402Challenge {
        const rawJson = typeof Buffer !== 'undefined'
            ? Buffer.from(headerValue, 'base64').toString('utf8')
            : atob(headerValue);
        return JSON.parse(rawJson) as X402Challenge;
    }

    /**
     * Sign an EIP-3009 TransferWithAuthorization and construct a base64-encoded PAYMENT-SIGNATURE header.
     *
     * Signs for:
     * - Asset: USD₮0 (0xe7cd86e13AC4309349F30B3435a9d337750fC82D) on Flare (Chain ID 14)
     * - Amount: 1000 base units (0.001 USD₮0)
     * - PayTo: 0x0A617D605a1010a74B8dA756E48D75bCef110ef4
     * - EIP-712 Domain: name="USD₮0", version="1", chainId=14, verifyingContract=asset
     * - Output: Base64 JSON containing x402Version: 2, resource, accepted, and payload (authorization + 65-byte signature)
     */
    async signEIP3009Payment(challenge: X402Challenge, signerOrKey: X402Signer): Promise<string> {
        // Select matching EIP-3009 option from challenge.
        // We strictly require eip155:14 (Flare mainnet) with USD₮0.
        // Falling back to any other network is UNSAFE: it would produce a payload
        // with the correct eip155:14 chainId domain but a foreign network identifier,
        // creating an internally inconsistent and invalid payment.
        const option =
            challenge.accepts.find(
                (o) =>
                    (o.network === 'eip155:14' || o.network === 'flare' || o.chain_id === 14) &&
                    (o.asset?.toLowerCase() === DEFAULT_FLARE_USDT0_ASSET.toLowerCase() ||
                        (o as any).token?.toLowerCase() === DEFAULT_FLARE_USDT0_ASSET.toLowerCase()),
            ) ?? challenge.accepts.find((o) => o.network === 'eip155:14' || o.chain_id === 14);

        if (!option) {
            throw new ProofRailsError(
                'No supported payment option found: this SDK currently supports EIP-3009 payment on Flare (eip155:14) with USD\u20ae0 (' + DEFAULT_FLARE_USDT0_ASSET + '). ' +
                'The challenge only offered: ' + challenge.accepts.map((o) => o.network || o.chain_id).join(', '),
                'UNSUPPORTED_PAYMENT_NETWORK',
                400,
            );
        }

        const asset = option.asset || (option as any).token || DEFAULT_FLARE_USDT0_ASSET;
        const payTo = option.payTo || option.recipient || (option as any).pay_to || DEFAULT_FLARE_USDT0_RECIPIENT;
        const amount = option.amount || '1000';
        const chainId = option.chain_id || DEFAULT_FLARE_CHAIN_ID;
        const domainName = option.extra?.name || 'USD₮0';
        const domainVersion = option.extra?.version || '1';

        // Set up account / signer
        let payerAddress: string;
        let signTypedDataFn: (domain: any, types: any, message: any) => Promise<string>;

        if (typeof signerOrKey === 'string') {
            const rawKey = signerOrKey.trim();
            const hexKey = (rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`) as `0x${string}`;
            const account = privateKeyToAccount(hexKey);
            payerAddress = account.address;
            signTypedDataFn = async (domain, types, message) => {
                return account.signTypedData({
                    domain,
                    types,
                    primaryType: 'TransferWithAuthorization',
                    message,
                });
            };
        } else if (typeof signerOrKey === 'object' && signerOrKey !== null && 'address' in signerOrKey) {
            payerAddress = signerOrKey.address;
            signTypedDataFn = async (domain, types, message) => {
                if ('signTypedData' in signerOrKey && typeof signerOrKey.signTypedData === 'function') {
                    // Try viem-style first, then ethers-style
                    try {
                        return await signerOrKey.signTypedData({
                            domain,
                            types,
                            primaryType: 'TransferWithAuthorization',
                            message,
                        });
                    } catch {
                        return await signerOrKey.signTypedData(domain, types, message);
                    }
                }
                throw new ProofRailsError('Signer does not support signTypedData', 'INVALID_SIGNER');
            };
        } else {
            throw new ProofRailsError('A valid private key or signer object is required for x402 v2 payment', 'SIGNER_REQUIRED');
        }

        // Generate a random 32-byte nonce
        const nonceBytes = new Uint8Array(32);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(nonceBytes);
        } else {
            for (let i = 0; i < 32; i++) nonceBytes[i] = Math.floor(Math.random() * 256);
        }
        const nonce = '0x' + Array.from(nonceBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

        const now = Math.floor(Date.now() / 1000);
        const validAfter = '0';
        const validBefore = String(now + (option.maxTimeoutSeconds || 3600));

        const domain = {
            name: domainName,
            version: domainVersion,
            chainId: BigInt(Number(chainId || DEFAULT_FLARE_CHAIN_ID)),
            verifyingContract: asset as `0x${string}`,
        };

        const types = {
            TransferWithAuthorization: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'validAfter', type: 'uint256' },
                { name: 'validBefore', type: 'uint256' },
                { name: 'nonce', type: 'bytes32' },
            ],
        };

        const rawValue = BigInt(String(amount || '1000'));

        const message = {
            from: payerAddress as `0x${string}`,
            to: payTo as `0x${string}`,
            value: rawValue,
            validAfter: BigInt(validAfter),
            validBefore: BigInt(validBefore),
            nonce: nonce as `0x${string}`,
        };

        const signature = await signTypedDataFn(domain, types, message);

        const payload: X402PaymentSignaturePayload = {
            x402Version: 2,
            resource: challenge.resource || { url: challenge.endpoint || '/premium_fx_lookup' },
            accepted: {
                scheme: option.scheme || 'exact',
                network: option.network || 'eip155:14',
                amount: amount,
                asset: asset,
                payTo: payTo,
                maxTimeoutSeconds: option.maxTimeoutSeconds || 300,
                extra: option.extra || {
                    name: domainName,
                    version: domainVersion,
                    facilitator: '0xa78F15ee5a1Ff1D89F6AD782a5f9b81f7C2aA4aE',
                },
            },
            payload: {
                authorization: {
                    from: payerAddress,
                    to: payTo,
                    value: amount,
                    validAfter,
                    validBefore,
                    nonce,
                },
                signature,
            },
        };

        const jsonStr = JSON.stringify(payload);
        return typeof Buffer !== 'undefined'
            ? Buffer.from(jsonStr).toString('base64')
            : btoa(jsonStr);
    }

    /**
     * Perform an HTTP request against an x402-gated endpoint.
     * If the endpoint returns HTTP 402, this method automatically parses the challenge,
     * signs an EIP-3009 authorization using the configured signer, attaches PAYMENT-SIGNATURE,
     * and retries the request to return the unlocked response.
     */
    async fetchWithPayment<T>(
        endpoint: string,
        body?: unknown,
        options: X402RequestOptions = {}
    ): Promise<T> {
        // Initial request attempt without payment header
        const firstResponse = await this.client.requestRaw('POST', endpoint, body, options);

        if (firstResponse.status !== 402) {
            if (!firstResponse.ok) {
                const errData = await firstResponse.json().catch(() => ({}));
                throw new ProofRailsError(
                    errData.message || errData.detail || `HTTP ${firstResponse.status}: ${firstResponse.statusText}`,
                    undefined,
                    firstResponse.status,
                    errData
                );
            }
            return firstResponse.json();
        }

        // Received HTTP 402 Payment Required: extract challenge
        const challengeHeader =
            firstResponse.headers.get('PAYMENT-REQUIRED') ||
            firstResponse.headers.get('payment-required');

        let challenge: X402Challenge;
        if (challengeHeader) {
            challenge = this.decodePaymentRequiredHeader(challengeHeader);
        } else {
            challenge = await firstResponse.json().catch(() => null);
            if (!challenge || !challenge.accepts) {
                throw new ProofRailsError('HTTP 402 returned without a valid PAYMENT-REQUIRED challenge', 'MISSING_CHALLENGE', 402);
            }
        }

        const signer =
            options.signer ||
            options.privateKey ||
            this.client.getSigner() ||
            this.client.getPrivateKey();

        if (!signer) {
            throw new ProofRailsError(
                'Endpoint requires x402 payment, but no signer or privateKey was provided in options or client configuration',
                'PAYMENT_REQUIRED',
                402,
                challenge
            );
        }

        // Produce the signed EIP-3009 PAYMENT-SIGNATURE header
        const paymentSignature = await this.signEIP3009Payment(challenge, signer);

        // Retry the exact request with PAYMENT-SIGNATURE
        const retryHeaders: Record<string, string> = {
            ...((options.headers as Record<string, string>) || {}),
            'PAYMENT-SIGNATURE': paymentSignature,
        };

        const retryResponse = await this.client.requestRaw('POST', endpoint, body, {
            ...options,
            headers: retryHeaders,
        });

        if (!retryResponse.ok) {
            const errData = await retryResponse.json().catch(() => ({}));
            throw new ProofRailsError(
                errData.detail || errData.message || `x402 payment settlement failed with HTTP ${retryResponse.status}`,
                errData.code || 'SETTLEMENT_FAILED',
                retryResponse.status,
                errData
            );
        }

        return retryResponse.json();
    }

    /**
     * Request an FX rate lookup from the premium oracle endpoint.
     * Automatically handles the x402 v2 payment challenge and returns the live rate
     * without requiring a pre-made transaction hash.
     */
    async premiumFxLookup(
        optionsOrPayment: FXLookupOptions | X402Payment = {},
        maybeOptions?: FXLookupOptions
    ): Promise<Record<string, unknown>> {
        // Detect if called with legacy payment object (first argument contains txHash)
        if ('txHash' in (optionsOrPayment as any)) {
            const legacyPayment = optionsOrPayment as X402Payment;
            const options = maybeOptions || {};
            return this.client.post('/v1/x402/premium/fx-lookup', {
                base_ccy: options.baseCcy || 'USD',
                quote_ccy: options.quoteCcy || 'FLR',
                provider: options.provider || 'ftso',
            }, {
                headers: { 'X-PAYMENT': this.createTransactionPaymentHeader(legacyPayment) },
            });
        }

        const options = optionsOrPayment as FXLookupOptions;
        return this.fetchWithPayment<Record<string, unknown>>(
            '/v1/x402/premium/fx-lookup',
            {
                base_ccy: options.baseCcy || 'USD',
                quote_ccy: options.quoteCcy || 'FLR',
                provider: options.provider || 'ftso',
            },
            options
        );
    }

    async premiumVerifyBundle(
        bundle: { bundleUrl?: string; bundleHash?: string },
        options?: X402RequestOptions
    ): Promise<Record<string, unknown>> {
        return this.fetchWithPayment<Record<string, unknown>>(
            '/v1/x402/premium/verify-bundle',
            {
                bundle_url: bundle.bundleUrl,
                bundle_hash: bundle.bundleHash,
            },
            options
        );
    }

    async premiumBulkVerify(
        bundleUrls: string[],
        options?: X402RequestOptions
    ): Promise<Record<string, unknown>> {
        return this.fetchWithPayment<Record<string, unknown>>(
            '/v1/x402/premium/bulk-verify',
            { bundle_urls: bundleUrls },
            options
        );
    }

    async premiumRefund(
        receiptId: string,
        reasonCode?: string,
        options?: X402RequestOptions
    ): Promise<Record<string, unknown>> {
        return this.fetchWithPayment<Record<string, unknown>>(
            '/v1/x402/premium/refund',
            {
                original_receipt_id: receiptId,
                reason_code: reasonCode,
            },
            options
        );
    }

    async premiumIsoMessage(
        receiptId: string,
        messageType: string,
        options?: X402RequestOptions
    ): Promise<Record<string, unknown>> {
        return this.fetchWithPayment<Record<string, unknown>>(
            `/v1/x402/premium/iso-message/${receiptId}/${messageType}`,
            undefined,
            options
        );
    }

    // ── Legacy Custom Transaction-Proof Helpers ──────────────────────────────

    /**
     * Create the JSON string for the custom ProofRails X-PAYMENT header
     * referencing an already broadcasted on-chain transaction.
     */
    createTransactionPaymentHeader(payment: X402Payment): string {
        return JSON.stringify({
            tx_hash: payment.txHash,
            amount: payment.amount,
            recipient: payment.recipient,
            currency: payment.currency || 'USDC',
            chain: payment.chain || 'base',
        });
    }

    /**
     * @deprecated Use createTransactionPaymentHeader or the automated x402 v2 payment client.
     */
    paymentHeader(payment: X402Payment): string {
        return this.createTransactionPaymentHeader(payment);
    }

    /**
     * Header dictionary for attaching legacy transaction proofs to custom fetch/HTTP requests.
     */
    createTransactionPaymentHeaders(payment: X402Payment): Record<string, string> {
        return {
            'X-PAYMENT': this.createTransactionPaymentHeader(payment),
        };
    }

    /**
     * @deprecated Use createTransactionPaymentHeaders or the automated x402 v2 payment client.
     */
    paymentHeaders(payment: X402Payment): Record<string, string> {
        return this.createTransactionPaymentHeaders(payment);
    }

    /**
     * Verify a legacy payment proof with the middleware (for diagnostics).
     */
    async verifyPayment(payment: X402Payment): Promise<X402PaymentVerification> {
        const response = await this.client.post<any>('/v1/x402/verify-payment', {
            tx_hash: payment.txHash,
            amount: payment.amount,
            recipient: payment.recipient,
            currency: payment.currency || 'USDC',
            chain: payment.chain || 'base',
        });
        return {
            verified: response.verified,
            paymentId: response.payment_id,
            txHash: response.tx_hash,
            error: response.error,
        };
    }
}
