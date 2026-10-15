/**
 * Project and API key related types
 */

export interface Project {
    projectId: string;
    label?: string;
    createdAt: string;
    receiptsCount?: number;
}

export interface APIKey {
    apiKey: string;
    projectId: string;
    label?: string;
    createdAt: string;
}

export interface CreateProjectOptions {
    /** Project name shown in the middleware dashboard. */
    name?: string;
    /** @deprecated Use name. */
    label?: string;
    /** EIP-4361 message signed by the project owner's wallet. */
    message: string;
    /** Signature for message. */
    signature: string;
}

/** Metadata for an API key. The raw secret is returned only in the response header on creation. */
export interface APIKeyInfo {
    id: string;
    label: string;
    role: string;
    projectId?: string | null;
    createdAt: string;
    revokedAt?: string | null;
}

export interface CreateAPIKeyOptions {
    /** The key is created for the project represented by the current API key. */
    label: string;
}

export interface WhoAmIResponse {
    role: string;
    projectId?: string | null;
    isAdmin: boolean;
}

export interface RegisteredProject {
    projectId: string;
    name: string;
    apiKey: string;
}

export interface ProjectAnchoringChain {
    name: string;
    contract: string;
    rpcUrl?: string | null;
    explorerBaseUrl?: string | null;
}

export interface ProjectConfig {
    anchoring: {
        executionMode: 'platform' | 'tenant';
        chains: ProjectAnchoringChain[];
    };
}
