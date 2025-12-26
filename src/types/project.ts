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
    label?: string;
}

export interface CreateAPIKeyOptions {
    projectId: string;
    label?: string;
}

export interface WhoAmIResponse {
    projectId: string;
    label?: string;
}
