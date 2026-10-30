/**
 * Main ProofRails SDK class
 */

import { APIClient } from './client';
import { ProjectsModule, AdminModule } from './modules/projects';
import { ReceiptsModule } from './modules/receipts';
import { VerificationModule } from './modules/verification';
import { StatementsModule } from './modules/statements';
import { EventsModule } from './modules/events';
import { EmbedModule } from './modules/embed';
import { AnchoringModule } from './modules/anchoring';
import { X402Module } from './modules/x402';
import { AgentsModule } from './modules/agents';
import { PlatformModule } from './modules/platform';
import {
    createPaymentReceipt,
    createDonationReceipt,
    createEscrowReceipt,
    createGrantReceipt,
    createRefundReceipt,
} from './templates';
import type { SDKConfig, Network } from './types/common';
import type {
    PaymentTemplateOptions,
    DonationTemplateOptions,
    EscrowTemplateOptions,
    GrantTemplateOptions,
    RefundTemplateOptions,
} from './templates';

export class ProofRails {
    private client: APIClient;

    /** Configured blockchain network */
    public readonly network: Network;

    /** Project and API key management */
    public readonly project: ProjectsModule;

    /** Admin operations (requires admin token) */
    public readonly admin: AdminModule;

    /** Receipt operations */
    public readonly receipts: ReceiptsModule;

    /** Verification operations */
    public readonly verify: VerificationModule;

    /** Statement generation */
    public readonly statements: StatementsModule;

    /** Live event updates */
    public readonly events: EventsModule;

    /** Embeddable widgets */
    public readonly embed: EmbedModule;

    /** Receipt-anchor queries and tenant anchoring confirmation. */
    public readonly anchors: AnchoringModule;

    /** x402 payment discovery and request-header helpers. */
    public readonly x402: X402Module;

    /** Autonomous-agent management and agent-data anchoring. */
    public readonly agents: AgentsModule;

    /** Webhooks, wallet monitoring, AI, Flare, auth, and operations endpoints. */
    public readonly platform: PlatformModule;

    /** Beginner-friendly templates (configured with default SDK network) */
    public readonly templates: {
        payment: (options: PaymentTemplateOptions) => ReturnType<typeof createPaymentReceipt>;
        donation: (options: DonationTemplateOptions) => ReturnType<typeof createDonationReceipt>;
        escrow: (options: EscrowTemplateOptions) => ReturnType<typeof createEscrowReceipt>;
        grant: (options: GrantTemplateOptions) => ReturnType<typeof createGrantReceipt>;
        refund: (options: RefundTemplateOptions) => ReturnType<typeof createRefundReceipt>;
    };

    constructor(config: SDKConfig = {}) {
        this.client = new APIClient(config);
        this.network = this.client.getNetwork();

        this.project = new ProjectsModule(this.client);
        this.admin = new AdminModule(this.client);
        this.receipts = new ReceiptsModule(this.client);
        this.verify = new VerificationModule(this.client);
        this.statements = new StatementsModule(this.client);
        this.events = new EventsModule(this.client);
        this.embed = new EmbedModule(this.client);
        this.anchors = new AnchoringModule(this.client);
        this.x402 = new X402Module(this.client);
        this.agents = new AgentsModule(this.client);
        this.platform = new PlatformModule(this.client);

        this.templates = {
            payment: (options) => createPaymentReceipt(this.receipts, options, this.network),
            donation: (options) => createDonationReceipt(this.receipts, options, this.network),
            escrow: (options) => createEscrowReceipt(this.receipts, options, this.network),
            grant: (options) => createGrantReceipt(this.receipts, options, this.network),
            refund: (options) => createRefundReceipt(this.receipts, options, this.network),
        };
    }

    /**
     * Create a new project with API key (self-serve)
     * This is a convenience method for beginners
     */
    static async createProject(options: {
        name?: string;
        label?: string;
        message: string;
        signature: string;
        network?: Network;
        baseUrl?: string;
    }): Promise<{ client: ProofRails; apiKey: string; projectId: string }> {
        const tempClient = new ProofRails({ network: options.network, baseUrl: options.baseUrl });
        const result = await tempClient.project.create({ name: options.name, label: options.label, message: options.message, signature: options.signature });

        const apiKey = result.apiKey;
        const projectId = result.projectId;

        const client = new ProofRails({
            apiKey,
            network: options.network,
            baseUrl: options.baseUrl // Propagate baseUrl
        });

        return {
            client,
            apiKey,
            projectId,
        };
    }

    /**
     * Update the API key for this client
     */
    setApiKey(apiKey: string): void {
        this.client.setApiKey(apiKey);
    }

    /**
     * Update the admin token for this client
     */
    setAdminToken(adminToken: string): void {
        this.client.setAdminToken(adminToken);
    }

    /**
     * Get the active network
     */
    getNetwork(): Network {
        return this.client.getNetwork();
    }

    /**
     * Get the API client instance
     */
    getClient(): APIClient {
        return this.client;
    }
}

export default ProofRails;
