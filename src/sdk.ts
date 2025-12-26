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
import {
    createPaymentReceipt,
    createDonationReceipt,
    createEscrowReceipt,
    createGrantReceipt,
    createRefundReceipt,
} from './templates';
import type { SDKConfig, Network } from './types/common';
import type { APIKey } from './types/project';
import type {
    PaymentTemplateOptions,
    DonationTemplateOptions,
    EscrowTemplateOptions,
    GrantTemplateOptions,
    RefundTemplateOptions,
} from './templates';

export class ProofRails {
    private client: APIClient;

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

    /** Beginner-friendly templates */
    public readonly templates: {
        payment: (options: PaymentTemplateOptions) => ReturnType<typeof createPaymentReceipt>;
        donation: (options: DonationTemplateOptions) => ReturnType<typeof createDonationReceipt>;
        escrow: (options: EscrowTemplateOptions) => ReturnType<typeof createEscrowReceipt>;
        grant: (options: GrantTemplateOptions) => ReturnType<typeof createGrantReceipt>;
        refund: (options: RefundTemplateOptions) => ReturnType<typeof createRefundReceipt>;
    };

    constructor(config: SDKConfig = {}) {
        this.client = new APIClient(config);

        this.project = new ProjectsModule(this.client);
        this.admin = new AdminModule(this.client);
        this.receipts = new ReceiptsModule(this.client);
        this.verify = new VerificationModule(this.client);
        this.statements = new StatementsModule(this.client);
        this.events = new EventsModule(this.client);
        this.embed = new EmbedModule(this.client);

        this.templates = {
            payment: (options) => createPaymentReceipt(this.receipts, options),
            donation: (options) => createDonationReceipt(this.receipts, options),
            escrow: (options) => createEscrowReceipt(this.receipts, options),
            grant: (options) => createGrantReceipt(this.receipts, options),
            refund: (options) => createRefundReceipt(this.receipts, options),
        };
    }

    /**
     * Create a new project with API key (self-serve)
     * This is a convenience method for beginners
     */
    static async createProject(options: {
        label?: string;
        network?: Network;
        baseUrl?: string;
    } = {}): Promise<{ client: ProofRails; apiKey: string; projectId: string }> {
        const tempClient = new ProofRails({ network: options.network, baseUrl: options.baseUrl });
        const result = await tempClient.project.create({ label: options.label }) as any;

        const apiKey = result.api_key || result.apiKey;
        const projectId = result.project_id || result.projectId;

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
}

export default ProofRails;
