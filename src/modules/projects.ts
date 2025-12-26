/**
 * Project and API key management module
 */

import type { APIClient } from '../client';
import type {
    Project,
    APIKey,
    CreateProjectOptions,
    CreateAPIKeyOptions,
    WhoAmIResponse,
} from '../types/project';

export class ProjectsModule {
    constructor(private client: APIClient) { }

    async getInfo(): Promise<WhoAmIResponse> {
        return this.client.get<WhoAmIResponse>('/v1/whoami');
    }

    async rotateKey(): Promise<APIKey> {
        return this.client.post<APIKey>('/v1/api-keys/rotate');
    }

    async create(options: CreateProjectOptions = {}): Promise<APIKey> {
        return this.client.post<APIKey>('/v1/public/api-keys', options);
    }
}

export class AdminModule {
    constructor(private client: APIClient) { }

    async createKey(options: CreateAPIKeyOptions): Promise<APIKey> {
        return this.client.post<APIKey>('/v1/admin/api-keys', options);
    }

    async deleteKey(keyId: string): Promise<void> {
        return this.client.delete(`/v1/admin/api-keys/${keyId}`);
    }
}
