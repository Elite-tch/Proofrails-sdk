import type { APIClient } from '../client';

/** Remaining middleware platform operations: health, auth, webhooks, monitoring, AI, and Flare tools. */
export class PlatformModule {
    constructor(private client: APIClient) { }
    health(): Promise<Record<string, unknown>> { return this.client.get('/v1/health'); }
    ping(): Promise<string> { return this.client.get('/v1/ping'); }
    capabilities(): Promise<Record<string, unknown>> { return this.client.get('/v1/capabilities'); }
    operation(id: string): Promise<Record<string, unknown>> { return this.client.get(`/v1/operations/${id}`); }
    adminConfig(): Promise<Record<string, unknown>> { return this.client.get('/v1/config'); }
    updateAdminConfig(config: Record<string, unknown>): Promise<Record<string, unknown>> { return this.client.put('/v1/config', config); }
    debugAnchor(bundleHash: string): Promise<Record<string, unknown>> { return this.client.post('/v1/debug/anchor', { bundle_hash: bundleHash }); }
    buildGeneratedSdk(request: Record<string, unknown>): Promise<Record<string, unknown>> { return this.client.post('/v1/sdk/build', request); }

    siweVerify(message: string, signature: string): Promise<Record<string, unknown>> { return this.client.post('/v1/auth/siwe-verify', { message, signature }); }
    linkedWallets(): Promise<Record<string, unknown>[]> { return this.client.get('/v1/auth/linked-wallets'); }
    unlinkWallet(address: string): Promise<unknown> { return this.client.delete(`/v1/auth/linked-wallets/${address}`); }
    mintKey(message: string, signature: string, label?: string): Promise<Record<string, unknown>> { return this.client.post('/v1/auth/siwe-mint-key', { message, signature, label }); }
    projects(): Promise<Record<string, unknown>[]> { return this.client.get('/v1/projects'); }

    createWebhook(body: Record<string, unknown>): Promise<Record<string, unknown>> { return this.client.post('/v1/webhooks', body); }
    listWebhooks(): Promise<Record<string, unknown>[]> { return this.client.get('/v1/webhooks'); }
    getWebhook(id: string): Promise<Record<string, unknown>> { return this.client.get(`/v1/webhooks/${id}`); }
    updateWebhook(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>> { return this.client.put(`/v1/webhooks/${id}`, body); }
    deleteWebhook(id: string): Promise<unknown> { return this.client.delete(`/v1/webhooks/${id}`); }
    testWebhook(id: string): Promise<Record<string, unknown>> { return this.client.post(`/v1/webhooks/${id}/test`); }

    monitorStatus(): Promise<Record<string, unknown>> { return this.client.get('/v1/monitor/status'); }
    monitorFtso(feed?: string): Promise<Record<string, unknown>> { return this.client.get(`/v1/monitor/ftso${feed ? `?feed=${encodeURIComponent(feed)}` : ''}`); }
    watchWallet(address: string, label?: string, projectId?: string): Promise<Record<string, unknown>> { return this.client.post('/v1/monitor/wallets', { address, label, project_id: projectId }); }
    watchedWallets(): Promise<Record<string, unknown>[]> { return this.client.get('/v1/monitor/wallets'); }
    unwatchWallet(address: string): Promise<unknown> { return this.client.delete(`/v1/monitor/wallets/${address}`); }

    aiAssist(payload: Record<string, unknown>): Promise<Record<string, unknown>> { return this.client.post('/v1/ai/assist', payload); }
    aiStatus(): Promise<Record<string, unknown>> { return this.client.get('/v1/ai/status'); }
    parseCommand(message: string, systemPrompt?: string): Promise<Record<string, unknown>> { return this.client.post('/v1/ai/parse-command', { message, system_prompt: systemPrompt }); }
    flareFeeds(): Promise<Record<string, unknown>> { return this.client.get('/v1/flare/feeds'); }
    flareFeed(symbol: string): Promise<Record<string, unknown>> { return this.client.get(`/v1/flare/feeds/${encodeURIComponent(symbol)}`); }
    prepareFdcAttestation(payload: Record<string, unknown>): Promise<Record<string, unknown>> { return this.client.post('/v1/flare/fdc/prepare-attestation', payload); }
    explainFlare(question: string, context?: string): Promise<Record<string, unknown>> { return this.client.post('/v1/flare/explain', { question, context }); }

    fiMessage(receiptId: string, type: 'camt056' | 'camt029' | 'pacs007' | 'pacs009', options: { reasonCode?: string; resolutionCode?: string } = {}): Promise<Record<string, unknown>> {
        return this.client.post(`/v1/iso/${type}/${receiptId}`, { reason_code: options.reasonCode, resolution_code: options.resolutionCode });
    }
    refund(receiptId: string, reasonCode?: string): Promise<Record<string, unknown>> { return this.client.post('/v1/iso/refund', { original_receipt_id: receiptId, reason_code: reasonCode }); }
}
