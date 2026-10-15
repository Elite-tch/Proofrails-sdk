/**
 * Project and API key management module
 */

import type { APIClient } from '../client';
import type {
    Project,
    APIKeyInfo,
    CreateProjectOptions,
    CreateAPIKeyOptions,
    WhoAmIResponse,
    RegisteredProject,
    ProjectConfig,
} from '../types/project';

export class ProjectsModule {
    constructor(private client: APIClient) { }

    async getInfo(): Promise<WhoAmIResponse> {
        const response = await this.client.get<any>('/v1/auth/me');
        return { role: response.role, projectId: response.project_id, isAdmin: response.is_admin };
    }

    /** Request a SIWE nonce before signing a project-registration message. */
    async getRegistrationNonce(): Promise<{ nonce: string; domain: string }> {
        return this.client.get('/v1/auth/nonce');
    }

    /** Register a project. The current middleware requires a SIWE signature. */
    async create(options: CreateProjectOptions): Promise<RegisteredProject> {
        const response = await this.client.post<any>('/v1/projects/register', {
            name: options.name || options.label,
            message: options.message,
            signature: options.signature,
        });
        return {
            projectId: response.project.id,
            name: response.project.name,
            apiKey: response.api_key,
        };
    }

    async getConfig(projectId: string): Promise<ProjectConfig> {
        const response = await this.client.get<any>(`/v1/projects/${projectId}/config`);
        return this.toConfig(response);
    }

    async updateConfig(projectId: string, config: ProjectConfig): Promise<ProjectConfig> {
        const response = await this.client.put<any>(`/v1/projects/${projectId}/config`, {
            anchoring: {
                execution_mode: config.anchoring.executionMode,
                chains: config.anchoring.chains.map((chain) => ({
                    name: chain.name,
                    contract: chain.contract,
                    rpc_url: chain.rpcUrl,
                    explorer_base_url: chain.explorerBaseUrl,
                })),
            },
        });
        return this.toConfig(response);
    }

    private toConfig(response: any): ProjectConfig {
        const anchoring = response.anchoring || {};
        return {
            anchoring: {
                executionMode: anchoring.execution_mode || 'platform',
                chains: (anchoring.chains || []).map((chain: any) => ({
                    name: chain.name,
                    contract: chain.contract,
                    rpcUrl: chain.rpc_url,
                    explorerBaseUrl: chain.explorer_base_url,
                })),
            },
        };
    }
}

export class AdminModule {
    constructor(private client: APIClient) { }

    async createKey(options: CreateAPIKeyOptions): Promise<APIKeyInfo> {
        const response = await this.client.post<any>('/v1/auth/api-keys', { label: options.label });
        return {
            id: response.id,
            label: response.label,
            role: response.role,
            projectId: response.project_id,
            createdAt: response.created_at,
            revokedAt: response.revoked_at,
        };
    }

    async listKeys(): Promise<APIKeyInfo[]> {
        const response = await this.client.get<any[]>('/v1/auth/api-keys');
        return response.map((key) => ({ id: key.id, label: key.label, role: key.role, projectId: key.project_id, createdAt: key.created_at, revokedAt: key.revoked_at }));
    }

    async deleteKey(keyId: string): Promise<void> {
        return this.client.delete(`/v1/auth/api-keys/${keyId}`);
    }
}
