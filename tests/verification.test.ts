import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIClient } from '../src/client';
import { VerificationModule } from '../src/modules/verification';

describe('VerificationModule', () => {
    let client: APIClient;

    beforeEach(() => {
        client = new APIClient({ baseUrl: 'http://test.local' });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rejects fabricated backend anchored status when on-chain verification does not match', async () => {
        // Backend says receipt is "anchored", but when verified on chain, it does NOT match
        vi.spyOn(client, 'get').mockResolvedValueOnce({
            id: 'rcpt_fabricated_123',
            status: 'anchored',
            bundle_hash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flare_txid: '0x999',
            anchored_at: '2026-01-01T00:00:00Z',
        });

        vi.spyOn(client, 'post').mockResolvedValueOnce({
            matches_onchain: false, // On-chain smart contract does not have this anchor!
            bundle_hash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flare_txid: null,
            errors: ['anchor_not_found_on_chain'],
        });

        const verification = new VerificationModule(client);
        const result = await verification.byReceiptId('rcpt_fabricated_123');

        // MUST BE FALSE despite status === "anchored"!
        expect(result.valid).toBe(false);
        expect(result.onChain).toBe(false);
        expect(result.checks?.onChainVerified).toBe(false);
        expect(result.checks?.statusAnchored).toBe(true);
        expect(result.errors).toContain('anchor_not_found_on_chain');
    });

    it('confirms validity when on-chain verification succeeds', async () => {
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
