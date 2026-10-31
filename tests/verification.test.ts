import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIClient } from '../src/client';
import { VerificationModule, DEFAULT_ANCHOR_CONTRACT } from '../src/modules/verification';

describe('VerificationModule', () => {
    let client: APIClient;
    const ANCHOR_TOPIC0 = '0xd414fe2d5071ea63896cf41c2e5a7bdd46aed543a8c8e83357a1ae468a383419';

    beforeEach(() => {
        client = new APIClient({ baseUrl: 'http://test.local', flareRpcUrl: 'http://mock-flare-rpc.local' });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rejects fabricated backend anchored status when on-chain verification does not match', async () => {
        const bundleHash = '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const txid = '0x999';

        vi.spyOn(client, 'get').mockResolvedValueOnce({
            id: 'rcpt_fabricated_123',
            status: 'anchored',
            bundle_hash: bundleHash,
            flare_txid: txid,
            anchored_at: '2026-01-01T00:00:00Z',
        });

        vi.spyOn(client, 'post').mockResolvedValueOnce({
            matches_onchain: false,
            bundle_hash: bundleHash,
            flare_txid: null,
            errors: ['anchor_not_found_on_chain'],
        });

        // Mock Flare RPC: tx receipt not found
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
            if (String(url).includes('mock-flare-rpc')) {
                return new Response(JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    result: null, // No receipt on chain!
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response('Not found', { status: 404 });
        });

        const verification = new VerificationModule(client);
        const result = await verification.byReceiptId('rcpt_fabricated_123');

        // MUST BE FALSE despite status === "anchored"!
        expect(result.valid).toBe(false);
        expect(result.onChain).toBe(false);
        expect(result.checks?.onChainVerified).toBe(false);
        expect(result.checks?.statusAnchored).toBe(true);
        expect(result.errors).toContain('anchor_tx_not_found_on_flare');
    });

    it('rejects when /v1/iso/verify returns matches_onchain: true but RPC receipt does not contain the hash', async () => {
        // CRITICAL AUDIT TEST:
        // A lying or compromised backend /v1/iso/verify endpoint says matches_onchain: true,
        // but the actual RPC transaction on Flare chain 14 does NOT contain the bundle hash in its anchor log!
        const bundleHash = '0x1111111111111111111111111111111111111111111111111111111111111111';
        const differentHash = '0x2222222222222222222222222222222222222222222222222222222222222222';
        const txid = '0xflare_tx_lying_backend';

        vi.spyOn(client, 'get').mockResolvedValueOnce({
            id: 'rcpt_adversarial_123',
            status: 'anchored',
            bundle_hash: bundleHash,
            flare_txid: txid,
            anchored_at: '2026-02-01T12:00:00Z',
        });

        // Lying backend endpoint falsely claims matches_onchain is true:
        vi.spyOn(client, 'post').mockResolvedValueOnce({
            matches_onchain: true,
            bundle_hash: bundleHash,
            flare_txid: txid,
        });

        // But actual RPC read of the transaction receipt contains a log with a different hash:
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
            if (String(url).includes('mock-flare-rpc')) {
                return new Response(JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    result: {
                        status: '0x1', // Success
                        transactionHash: txid,
                        logs: [
                            {
                                address: DEFAULT_ANCHOR_CONTRACT,
                                topics: [ANCHOR_TOPIC0],
                                // Log contains differentHash, not bundleHash!
                                data: differentHash + '0000000000000000000000000000000000000000000000000000000065bbbbbb',
                            },
                        ],
                    },
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response('Not found', { status: 404 });
        });

        const verification = new VerificationModule(client);
        const result = await verification.byReceiptId('rcpt_adversarial_123');

        // MUST be valid: false because RPC verification takes precedence over /v1/iso/verify!
        expect(result.valid).toBe(false);
        expect(result.onChain).toBe(false);
        expect(result.checks?.onChainVerified).toBe(false);
        expect(result.errors).toContain('anchor_log_hash_mismatch_on_flare');
    });

    it('confirms validity when direct Flare RPC verification succeeds with matching event hash', async () => {
        const bundleHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const txid = '0xflare_tx_confirmed';

        vi.spyOn(client, 'get').mockResolvedValueOnce({
            id: 'rcpt_real_123',
            status: 'anchored',
            bundle_hash: bundleHash,
            flare_txid: txid,
            anchored_at: '2026-02-01T12:00:00Z',
        });

        vi.spyOn(client, 'post').mockResolvedValueOnce({
            matches_onchain: true,
            bundle_hash: bundleHash,
            flare_txid: txid,
            anchored_at: '2026-02-01T12:00:00Z',
        });

        // Mock Flare RPC returning valid EvidenceAnchored event log
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
            if (String(url).includes('mock-flare-rpc')) {
                const bundleHashWithout0x = bundleHash.slice(2);
                return new Response(JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    result: {
                        status: '0x1',
                        transactionHash: txid,
                        logs: [
                            {
                                address: DEFAULT_ANCHOR_CONTRACT,
                                topics: [ANCHOR_TOPIC0],
                                // First 32 bytes of data is the bundleHash
                                data: '0x' + bundleHashWithout0x + '0000000000000000000000000000000000000000000000000000000065ba1234',
                            },
                        ],
                    },
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response('Not found', { status: 404 });
        });

        const verification = new VerificationModule(client);
        const result = await verification.byReceiptId('rcpt_real_123');

        expect(result.valid).toBe(true);
        expect(result.onChain).toBe(true);
        expect(result.anchorTx).toBe(txid);
        expect(result.checks?.receiptExists).toBe(true);
        expect(result.checks?.statusAnchored).toBe(true);
        expect(result.checks?.bundleHashPresent).toBe(true);
        expect(result.checks?.onChainVerified).toBe(true);
        expect(result.checks?.transactionHashConfirmed).toBe(true);
    });

    it('fails verification if bundle hash is missing or invalid', async () => {
        vi.spyOn(client, 'get').mockResolvedValueOnce({
            id: 'rcpt_no_hash',
            status: 'anchored',
            bundle_hash: '',
        });

        const verification = new VerificationModule(client);
        const result = await verification.byReceiptId('rcpt_no_hash');

        expect(result.valid).toBe(false);
        expect(result.checks?.bundleHashPresent).toBe(false);
        expect(result.errors).toContain('missing_bundle_hash');
    });
});
