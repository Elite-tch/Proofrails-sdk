import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIClient } from '../src/client';
import { ProofRailsError } from '../src/types/common';

describe('APIClient', () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
        originalFetch = globalThis.fetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    describe('Authentication Headers Preservation', () => {
        it('preserves X-API-Key and Authorization when custom Idempotency-Key is provided', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ success: true }),
            });
            globalThis.fetch = mockFetch;

            const client = new APIClient({
                baseUrl: 'http://test.local',
                apiKey: 'test-api-key',
                adminToken: 'test-admin-token',
            });

            await client.post('/v1/test', { data: 123 }, {
                headers: {
                    'Idempotency-Key': 'unique-key-1',
                },
            });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const callArgs = mockFetch.mock.calls[0];
            const headers = callArgs[1].headers;

            expect(headers['X-API-Key']).toBe('test-api-key');
            expect(headers['Authorization']).toBe('Bearer test-admin-token');
            expect(headers['Idempotency-Key']).toBe('unique-key-1');
            expect(headers['Content-Type']).toBe('application/json');
        });

        it('preserves X-API-Key when custom X-PAYMENT header is provided', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ success: true }),
            });
            globalThis.fetch = mockFetch;

            const client = new APIClient({
                baseUrl: 'http://test.local',
                apiKey: 'test-api-key',
            });

            await client.get('/v1/premium', {
                headers: {
                    'X-PAYMENT': '{"tx_hash":"0x123"}',
                },
            });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const headers = mockFetch.mock.calls[0][1].headers;

            expect(headers['X-API-Key']).toBe('test-api-key');
            expect(headers['X-PAYMENT']).toBe('{"tx_hash":"0x123"}');
        });
    });

    describe('Safe Retries and Idempotency Enforcement', () => {
        it('never retries HTTP 400 Bad Request', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ detail: 'invalid input parameter' }),
            });
            globalThis.fetch = mockFetch;

            const client = new APIClient({
                baseUrl: 'http://test.local',
                retries: 3,
                retryDelay: 1,
            });

            await expect(client.post('/v1/test', {})).rejects.toThrow(ProofRailsError);
            // Must NOT retry 400 error!
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('retries GET requests on 500 errors', async () => {
            let attempts = 0;
            const mockFetch = vi.fn().mockImplementation(async () => {
                attempts++;
                if (attempts < 3) {
                    return {
                        ok: false,
                        status: 500,
                        statusText: 'Internal Server Error',
                        headers: new Headers(),
                        json: async () => ({}),
                    };
                }
                return {
                    ok: true,
                    headers: new Headers({ 'content-type': 'application/json' }),
                    json: async () => ({ result: 'ok' }),
                };
            });
            globalThis.fetch = mockFetch;

            const client = new APIClient({
                baseUrl: 'http://test.local',
                retries: 3,
                retryDelay: 1,
            });

            const res = await client.get<{ result: string }>('/v1/safe-endpoint');
            expect(res.result).toBe('ok');
            expect(mockFetch).toHaveBeenCalledTimes(3);
        });

        it('does NOT retry mutating POST requests on 500 without Idempotency-Key', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                headers: new Headers(),
                json: async () => ({}),
            });
            globalThis.fetch = mockFetch;

            const client = new APIClient({
                baseUrl: 'http://test.local',
                retries: 3,
                retryDelay: 1,
            });

            await expect(client.post('/v1/payments', { amount: 100 })).rejects.toThrow(ProofRailsError);
            // Must NOT retry POST without idempotency key
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('retries mutating POST requests on 500 when Idempotency-Key is present', async () => {
            let attempts = 0;
            const mockFetch = vi.fn().mockImplementation(async () => {
                attempts++;
                if (attempts < 2) {
                    return {
                        ok: false,
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers(),
                        json: async () => ({}),
                    };
                }
                return {
                    ok: true,
                    headers: new Headers({ 'content-type': 'application/json' }),
                    json: async () => ({ receipt_id: 'rcpt_123' }),
                };
            });
            globalThis.fetch = mockFetch;

            const client = new APIClient({
                baseUrl: 'http://test.local',
                retries: 3,
                retryDelay: 1,
            });

            const res = await client.post<{ receipt_id: string }>(
                '/v1/payments',
                { amount: 100 },
                { headers: { 'Idempotency-Key': 'idemp-uuid-1' } }
            );

            expect(res.receipt_id).toBe('rcpt_123');
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('Rate Limit Extraction', () => {
        it('correctly extracts rate limit headers from responses', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: new Headers({
                    'content-type': 'application/json',
                    'X-RateLimit-Limit': '120',
                    'X-RateLimit-Remaining': '118',
                    'X-RateLimit-Reset': '1700000000',
                }),
                json: async () => ({ ok: true }),
            });
            globalThis.fetch = mockFetch;

            const client = new APIClient({ baseUrl: 'http://test.local' });
            await client.get('/v1/test');

            const info = client.getRateLimitInfo();
            expect(info).not.toBeNull();
            expect(info?.limit).toBe(120);
            expect(info?.remaining).toBe(118);
            expect(info?.reset).toBe(1700000000);
            expect(info?.resetDate.getTime()).toBe(1700000000 * 1000);
        });
    });

    describe('Network Configuration', () => {
        it('stores and propagates configured network', () => {
            const client = new APIClient({ network: 'flare' });
            expect(client.getNetwork()).toBe('flare');

            client.setNetwork('coston2');
            expect(client.getNetwork()).toBe('coston2');
        });
    });
});
