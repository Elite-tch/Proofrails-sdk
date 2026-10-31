import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIClient } from '../src/client';
import { X402Module } from '../src/modules/x402';
import type { X402Challenge } from '../src/types/x402';

describe('X402Module (v2 Protocol & Legacy Helpers)', () => {
    let client: APIClient;
    const TEST_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
    // Expected address for this private key
    const EXPECTED_PAYER_ADDRESS = '0x14791697260e4c9a71f18484c9f997b308e59325';

    const MOCK_CHALLENGE: X402Challenge = {
        x402Version: 2,
        error: 'payment_required',
        resource: { url: '/premium_fx_lookup' },
        accepts: [
            {
                scheme: 'exact',
                network: 'eip155:14',
                amount: '1000',
                asset: '0xe7cd86e13AC4309349F30B3435a9d337750fC82D',
                payTo: '0x0A617D605a1010a74B8dA756E48D75bCef110ef4',
                maxTimeoutSeconds: 300,
                extra: {
                    name: 'USD₮0',
                    version: '1',
                    facilitator: '0xa78F15ee5a1Ff1D89F6AD782a5f9b81f7C2aA4aE',
                },
            },
        ],
    };

    beforeEach(() => {
        client = new APIClient({ baseUrl: 'http://test.local', privateKey: TEST_PRIVATE_KEY });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('signs EIP-3009 authorization and produces valid base64 PAYMENT-SIGNATURE header', async () => {
        const x402 = new X402Module(client);
        const headerBase64 = await x402.signEIP3009Payment(MOCK_CHALLENGE, TEST_PRIVATE_KEY);

        expect(headerBase64).toBeDefined();
        const decoded = JSON.parse(Buffer.from(headerBase64, 'base64').toString('utf8'));

        expect(decoded.x402Version).toBe(2);
        expect(decoded.resource.url).toBe('/premium_fx_lookup');
        expect(decoded.accepted.scheme).toBe('exact');
        expect(decoded.accepted.network).toBe('eip155:14');
        expect(decoded.accepted.amount).toBe('1000');
        expect(decoded.accepted.asset).toBe('0xe7cd86e13AC4309349F30B3435a9d337750fC82D');
        expect(decoded.accepted.payTo).toBe('0x0A617D605a1010a74B8dA756E48D75bCef110ef4');

        // Check authorization fields
        const auth = decoded.payload.authorization;
        expect(auth.from.toLowerCase()).toBe(EXPECTED_PAYER_ADDRESS.toLowerCase());
        expect(auth.to).toBe('0x0A617D605a1010a74B8dA756E48D75bCef110ef4');
        expect(auth.value).toBe('1000');
        expect(auth.validAfter).toBe('0');
        expect(Number(auth.validBefore)).toBeGreaterThan(0);
        expect(auth.nonce).toMatch(/^0x[0-9a-fA-F]{64}$/);

        // Check 65-byte signature (0x + 130 hex chars)
        const signature = decoded.payload.signature;
        expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
    });

    it('premiumFxLookup handles 402 challenge, signs authorization, and returns rate without pre-made tx', async () => {
        const x402 = new X402Module(client);

        const encodedChallenge = Buffer.from(JSON.stringify(MOCK_CHALLENGE)).toString('base64');

        // First call returns 402 with PAYMENT-REQUIRED header
        // Second call with PAYMENT-SIGNATURE returns unlocked 200 JSON
        let requestCount = 0;
        vi.spyOn(client, 'requestRaw').mockImplementation(async (method, endpoint, body, options: any) => {
            requestCount++;
            if (requestCount === 1) {
                return new Response(JSON.stringify(MOCK_CHALLENGE), {
                    status: 402,
                    headers: {
                        'Content-Type': 'application/json',
                        'PAYMENT-REQUIRED': encodedChallenge,
                    },
                });
            }

            // Verify retry carries PAYMENT-SIGNATURE header
            expect(options?.headers?.['PAYMENT-SIGNATURE']).toBeDefined();
            const decodedSig = JSON.parse(Buffer.from(options.headers['PAYMENT-SIGNATURE'], 'base64').toString('utf8'));
            expect(decodedSig.x402Version).toBe(2);
            expect(decodedSig.payload.signature).toMatch(/^0x[0-9a-fA-F]{130}$/);

            return new Response(JSON.stringify({
                pair: 'USD/FLR',
                rate: '35.42',
                provider: 'ftso',
                timestamp: '2026-10-31T07:00:00Z',
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        });

        // Call WITHOUT passing any pre-made transaction hash
        const result = await x402.premiumFxLookup({
            baseCcy: 'USD',
            quoteCcy: 'FLR',
            provider: 'ftso',
        });

        expect(result).toBeDefined();
        expect(result.rate).toBe('35.42');
        expect(result.pair).toBe('USD/FLR');
        expect(requestCount).toBe(2);
    });

    it('formats legacy transaction-proof payment headers correctly', () => {
        const x402 = new X402Module(client);
        const legacyProof = {
            txHash: '0xabc_legacy_hash',
            amount: '0.001',
            recipient: '0x0A617D605a1010a74B8dA756E48D75bCef110ef4',
            currency: 'USDC',
            chain: 'base',
        };

        const headerJson = x402.createTransactionPaymentHeader(legacyProof);
        const parsed = JSON.parse(headerJson);

        expect(parsed.tx_hash).toBe('0xabc_legacy_hash');
        expect(parsed.amount).toBe('0.001');
        expect(parsed.recipient).toBe('0x0A617D605a1010a74B8dA756E48D75bCef110ef4');

        const headers = x402.createTransactionPaymentHeaders(legacyProof);
        expect(headers['X-PAYMENT']).toBe(headerJson);
    });
});
