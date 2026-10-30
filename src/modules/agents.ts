import type { APIClient } from '../client';

export interface AgentCreate {
    name: string;
    walletAddress: string;
    xmtpAddress?: string;
    pricingRules?: Record<string, string>;
}

export interface AgentUpdate {
    name?: string;
    status?: string;
    xmtpAddress?: string;
    pricingRules?: Record<string, string>;
}

export interface Agent {
    id: string;
    name: string;
    walletAddress: string;
    xmtpAddress?: string | null;
    pricingRules?: Record<string, string>;
    status: string;
    projectId?: string | null;
    createdAt?: string | null;
}

export interface AgentAnchoringConfig {
    autoAnchorEnabled?: boolean;
    anchorOnPayment?: boolean;
    anchorWalletAddress?: string;
}

/** Autonomous-agent configuration, testing, and data anchoring. */
export class AgentsModule {
    constructor(private client: APIClient) { }

    async create(input: AgentCreate): Promise<Agent> {
        return this.toAgent(await this.client.post<any>('/v1/agents', this.agentBody(input)));
    }

    async list(): Promise<Agent[]> {
        return (await this.client.get<any[]>('/v1/agents')).map((agent) => this.toAgent(agent));
    }

    async get(id: string): Promise<Agent> {
        return this.toAgent(await this.client.get<any>(`/v1/agents/${id}`));
    }

    async update(id: string, input: AgentUpdate): Promise<{ id: string; status: string }> {
        return this.client.put(`/v1/agents/${id}`, this.agentBody(input));
    }

    async delete(id: string): Promise<{ id: string; status: string }> {
        return this.client.delete(`/v1/agents/${id}`);
    }

    async stats(id: string, days = 7): Promise<Record<string, unknown>> {
        return this.client.get(`/v1/agents/${id}/stats?days=${days}`);
    }

    async test(id: string, command: string): Promise<Record<string, unknown>> {
        return this.client.post(`/v1/agents/${id}/test`, { command });
    }

    async updateAiConfig(id: string, config: Record<string, unknown>): Promise<{ id: string; status: string }> {
        return this.client.put(`/v1/agents/${id}/ai-config`, config);
    }

    async testAi(id: string, testMessage: string): Promise<Record<string, unknown>> {
        return this.client.post(`/v1/agents/${id}/test-ai`, { test_message: testMessage });
    }

    /** Download an autonomous agent template package (POST /v1/agents/{id}/download-template). */
    async downloadTemplate(id: string): Promise<Blob> {
        return this.client.download(`/v1/agents/${id}/download-template`, { method: 'POST' });
    }

    async getAnchoringConfig(id: string): Promise<Record<string, unknown>> {
        return this.client.get(`/v1/agents/${id}/anchoring-config`);
    }

    /** Update anchoring configuration without handling or transmitting private keys */
    async updateAnchoringConfig(id: string, config: AgentAnchoringConfig): Promise<Record<string, unknown>> {
        return this.client.put(`/v1/agents/${id}/anchoring-config`, {
            auto_anchor_enabled: config.autoAnchorEnabled,
            anchor_on_payment: config.anchorOnPayment,
            anchor_wallet_address: config.anchorWalletAddress,
        });
    }

    async anchorData(id: string, data: Record<string, unknown>, options: { description?: string; chain?: string; submitOnchain?: boolean } = {}): Promise<Record<string, unknown>> {
        return this.client.post(`/v1/agents/${id}/anchor-data`, {
            data,
            description: options.description,
            chain: options.chain,
            submit_onchain: options.submitOnchain,
        });
    }

    async anchorHash(id: string, bundleHash: string, receiptId?: string): Promise<Record<string, unknown>> {
        return this.client.post(`/v1/agents/${id}/anchor`, {
            bundle_hash: bundleHash,
            receipt_id: receiptId,
        });
    }

    async listAnchors(id: string, options: { days?: number; status?: string } = {}): Promise<Record<string, unknown>[]> {
        const q = new URLSearchParams();
        if (options.days) q.set('days', String(options.days));
        if (options.status) q.set('status', options.status);
        const query = q.toString();
        return this.client.get(`/v1/agents/${id}/anchors${query ? `?${query}` : ''}`);
    }

    async activity(id: string, days = 7): Promise<Record<string, unknown>[]> {
        return this.client.get(`/v1/agents/${id}/activity-unified?days=${days}`);
    }

    private agentBody(input: AgentCreate | AgentUpdate): Record<string, unknown> {
        return {
            name: input.name,
            ...('status' in input ? { status: input.status } : {}),
            ...('walletAddress' in input ? { wallet_address: input.walletAddress } : {}),
            xmtp_address: input.xmtpAddress,
            pricing_rules: input.pricingRules,
        };
    }

    private toAgent(agent: any): Agent {
        return {
            id: agent.id,
            name: agent.name,
            walletAddress: agent.wallet_address,
            xmtpAddress: agent.xmtp_address,
            pricingRules: agent.pricing_rules,
            status: agent.status,
            projectId: agent.project_id,
            createdAt: agent.created_at,
        };
    }
}
