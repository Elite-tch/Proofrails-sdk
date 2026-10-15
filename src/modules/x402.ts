import type { APIClient } from '../client';
import type { X402Payment, X402PaymentVerification, X402Price } from '../types/x402';

/** x402 discovery and payment-proof helpers. It never signs or submits a wallet transaction. */
export class X402Module {
    constructor(private client: APIClient) { }

    async pricing(): Promise<X402Price[]> {
        return this.client.get('/v1/x402/pricing');
    }

    async updatePricing(prices: X402Price[]): Promise<Record<string, unknown>> { return this.client.post('/v1/x402/pricing', prices); }
    async payments(options: { limit?: number; offset?: number; currency?: string; chain?: string; status?: string; paymentType?: string } = {}): Promise<Record<string, unknown>> {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries({ limit: options.limit, offset: options.offset, currency: options.currency, chain: options.chain, status: options.status, payment_type: options.paymentType })) if (value !== undefined) query.set(key, String(value));
        const queryString = query.toString();
        return this.client.get(`/v1/x402/payments${queryString ? `?${queryString}` : ''}`);
    }
    async revenue(days = 7): Promise<Record<string, unknown>> { return this.client.get(`/v1/x402/revenue?days=${days}`); }
    async facilitatorConfig(): Promise<Record<string, unknown>> { return this.client.get('/v1/x402/facilitator-config'); }

    /** Serialize a wallet transaction proof for the X-PAYMENT request header. */
    paymentHeader(payment: X402Payment): string {
        return JSON.stringify({
            tx_hash: payment.txHash,
            amount: payment.amount,
            recipient: payment.recipient,
            currency: payment.currency || 'USDC',
            chain: payment.chain || 'base',
        });
    }

    /** Verify a payment proof with the middleware (useful for testing and diagnostics). */
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

    async premiumVerifyBundle(payment: X402Payment, bundle: { bundleUrl?: string; bundleHash?: string }): Promise<Record<string, unknown>> { return this.premiumPost('/v1/x402/premium/verify-bundle', payment, { bundle_url: bundle.bundleUrl, bundle_hash: bundle.bundleHash }); }
    async premiumFxLookup(payment: X402Payment, options: { baseCcy?: string; quoteCcy?: string; provider?: string } = {}): Promise<Record<string, unknown>> { return this.premiumPost('/v1/x402/premium/fx-lookup', payment, { base_ccy: options.baseCcy || 'USD', quote_ccy: options.quoteCcy || 'FLR', provider: options.provider || 'ftso' }); }
    async premiumBulkVerify(payment: X402Payment, bundleUrls: string[]): Promise<Record<string, unknown>> { return this.premiumPost('/v1/x402/premium/bulk-verify', payment, { bundle_urls: bundleUrls }); }
    async premiumRefund(payment: X402Payment, receiptId: string, reasonCode?: string): Promise<Record<string, unknown>> { return this.premiumPost('/v1/x402/premium/refund', payment, { original_receipt_id: receiptId, reason_code: reasonCode }); }
    async premiumIsoMessage(payment: X402Payment, receiptId: string, messageType: string): Promise<Record<string, unknown>> { return this.client.get(`/v1/x402/premium/iso-message/${receiptId}/${messageType}`, { headers: { 'X-PAYMENT': this.paymentHeader(payment) } }); }

    private premiumPost(path: string, payment: X402Payment, body: Record<string, unknown>): Promise<Record<string, unknown>> {
        return this.client.post(path, body, { headers: { 'X-PAYMENT': this.paymentHeader(payment) } });
    }
}
