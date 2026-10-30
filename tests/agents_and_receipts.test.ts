import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIClient } from '../src/client';
import { AgentsModule } from '../src/modules/agents';
import { ReceiptsModule } from '../src/modules/receipts';
import { ProofRails } from '../src/sdk';

describe('AgentsModule & Security', () => {
    let client: APIClient;

    beforeEach(() => {
        client = new APIClient({ baseUrl: 'http://test.local' });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('updateAnchoringConfig never transmits private keys', async () => {
        const putSpy = vi.spyOn(client, 'put').mockResolvedValueOnce({ status: 'ok' });

        const agents = new AgentsModule(client);
        await agents.updateAnchoringConfig('agent_1', {
            autoAnchorEnabled: true,
            anchorOnPayment: true,
            anchorWalletAddress: '0x1234567890123456789012345678901234567890',
        });

        expect(putSpy).toHaveBeenCalledTimes(1);
        const payload = putSpy.mock.calls[0][1] as Record<string, unknown>;

        expect(payload.auto_anchor_enabled).toBe(true);
        expect(payload.anchor_on_payment).toBe(true);
        expect(payload.anchor_wallet_address).toBe('0x1234567890123456789012345678901234567890');
        expect(payload).not.toHaveProperty('anchor_private_key');
        expect(payload).not.toHaveProperty('anchorPrivateKey');
    });

    it('downloadTemplate calls backend with POST method', async () => {
        const downloadSpy = vi.spyOn(client, 'download').mockResolvedValueOnce(new Blob(['mock-template']));

        const agents = new AgentsModule(client);
        await agents.downloadTemplate('agent_42');

        expect(downloadSpy).toHaveBeenCalledWith('/v1/agents/agent_42/download-template', { method: 'POST' });
    });
});

describe('ReceiptsModule & ISO Artifacts', () => {
    let client: APIClient;

    beforeEach(() => {
        client = new APIClient({ baseUrl: 'http://test.local' });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('getArtifacts maps pacs.008, camt.052, and preserves all backend artifact types', async () => {
        vi.spyOn(client, 'get').mockImplementation(async (endpoint: string) => {
            if (endpoint.includes('/messages/')) {
                return [
                    { type: 'pain.001', messageId: 'm1', url: 'http://test.local/files/pain001.xml' },
                    { type: 'pacs.008', messageId: 'm2', url: 'http://test.local/files/pacs008.xml' },
                    { type: 'camt.052', messageId: 'm3', url: 'http://test.local/files/camt052.xml' },
                    { type: 'camt.054', messageId: 'm4', url: 'http://test.local/files/camt054.xml' },
                    { type: 'pacs.004', messageId: 'm5', url: 'http://test.local/files/pacs004.xml' },
                ];
            }
            if (endpoint.includes('/receipts/')) {
                return {
                    id: 'rcpt_1',
                    bundle_url: 'http://test.local/files/evidence.zip',
                };
            }
            return {};
        });

        const receipts = new ReceiptsModule(client);
        const artifacts = await receipts.getArtifacts('rcpt_1');

        // Check specific getters
        expect(artifacts.pain001Url).toBe('http://test.local/files/pain001.xml');
        expect(artifacts.pacs008Url).toBe('http://test.local/files/pacs008.xml');
        expect(artifacts.camt052Url).toBe('http://test.local/files/camt052.xml');
        expect(artifacts.camt054Url).toBe('http://test.local/files/camt054.xml');
        expect(artifacts.pacs004Url).toBe('http://test.local/files/pacs004.xml');

        // Check complete dictionary preserves pacs.008 without silently discarding
        expect(artifacts.artifacts?.['pacs.008']).toBe('http://test.local/files/pacs008.xml');
        expect(artifacts.messages).toHaveLength(5);
    });
});

describe('ProofRails Templates & Network Resolution', () => {
    it('templates default to configured SDK network and appropriate currency', async () => {
        const flareSdk = new ProofRails({ network: 'flare', baseUrl: 'http://test.local' });
        const createSpy = vi.spyOn(flareSdk.receipts, 'create').mockResolvedValueOnce({
            id: 'rcpt_flare',
            status: 'pending',
            transactionHash: '0x123',
            chain: 'flare',
            amount: '100',
            currency: 'FLR',
            sender: 'Alice',
            receiver: 'Bob',
            reference: 'Payment: Services (Tx: 0x123)',
            createdAt: new Date().toISOString(),
        });

        await flareSdk.templates.payment({
            amount: 100,
            from: 'Alice',
            to: 'Bob',
            purpose: 'Services',
            transactionHash: '0x123',
        });

        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            chain: 'flare',
            currency: 'FLR',
        }));
    });

    it('templates default to coston2 and C2FLR when network is coston2', async () => {
        const testnetSdk = new ProofRails({ network: 'coston2', baseUrl: 'http://test.local' });
        const createSpy = vi.spyOn(testnetSdk.receipts, 'create').mockResolvedValueOnce({
            id: 'rcpt_c2',
            status: 'pending',
            transactionHash: '0x456',
            chain: 'coston2',
            amount: '50',
            currency: 'C2FLR',
            sender: 'Alice',
            receiver: 'Bob',
            reference: 'Payment: Test (Tx: 0x456)',
            createdAt: new Date().toISOString(),
        });

        await testnetSdk.templates.payment({
            amount: 50,
            from: 'Alice',
            to: 'Bob',
            purpose: 'Test',
            transactionHash: '0x456',
        });

        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            chain: 'coston2',
            currency: 'C2FLR',
        }));
    });
});
