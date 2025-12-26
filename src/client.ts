/**
 * Core HTTP client for ProofRails API
 */

import type { SDKConfig } from './types/common';
import { ProofRailsError } from './types/common';

export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number; // Unix timestamp
    resetDate: Date;
}

export class APIClient {
    private baseUrl: string;
    private apiKey?: string;
    private adminToken?: string;
    private timeout: number;
    private retries: number;
    private retryDelay: number;
    private rateLimitInfo: RateLimitInfo | null = null;

    constructor(config: SDKConfig = {}) {
        // Read from environment variable if available (Next.js)
        const envBaseUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_PROOFRAILS_BASE_URL;

        // Production API endpoint
        const defaultBaseUrl = 'https://proofrails-clone-middleware.onrender.com';

        this.baseUrl = config.baseUrl || envBaseUrl || defaultBaseUrl;
        this.apiKey = config.apiKey;
        this.adminToken = config.adminToken;
        this.timeout = config.timeout || 30000;
        this.retries = config.retries ?? 3; // Default 3 retries
        this.retryDelay = config.retryDelay ?? 1000; // Default 1s delay
    }

    getRateLimitInfo(): RateLimitInfo | null {
        return this.rateLimitInfo;
    }

    async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>('GET', endpoint, undefined, options);
    }

    async post<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
        return this.request<T>('POST', endpoint, body, options);
    }

    async put<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
        return this.request<T>('PUT', endpoint, body, options);
    }

    async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>('DELETE', endpoint, undefined, options);
    }

    private async request<T>(
        method: string,
        endpoint: string,
        body?: unknown,
        options: RequestInit = {},
        attempt: number = 0
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }

        if (this.adminToken) {
            headers['Authorization'] = `Bearer ${this.adminToken}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            console.log(`[ProofRails SDK] ${method} ${url}${attempt > 0 ? ` (retry ${attempt}/${this.retries})` : ''}`);
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal,
                ...options,
            });

            clearTimeout(timeoutId);

            // Extract rate limit info from headers
            this.extractRateLimitInfo(response);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new ProofRailsError(
                    errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
                    errorData.code,
                    response.status,
                    errorData
                );

                // Retry on 5xx errors or rate limit (429)
                if (this.shouldRetry(response.status, attempt)) {
                    return this.retryRequest(method, endpoint, body, options, attempt);
                }

                throw error;
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof ProofRailsError) {
                // Retry on network errors
                if (this.shouldRetry(0, attempt)) {
                    return this.retryRequest(method, endpoint, body, options, attempt);
                }
                throw error;
            }

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new ProofRailsError(`Request timeout after ${this.timeout}ms`, 'TIMEOUT');
                }

                // Retry on network errors
                if (this.shouldRetry(0, attempt)) {
                    return this.retryRequest(method, endpoint, body, options, attempt);
                }

                throw new ProofRailsError(error.message, 'NETWORK_ERROR');
            }

            throw new ProofRailsError('Unknown error occurred', 'UNKNOWN_ERROR');
        }
    }

    private shouldRetry(statusCode: number, attempt: number): boolean {
        if (attempt >= this.retries) return false;

        // Retry on network errors (statusCode 0)
        if (statusCode === 0) return true;

        // Retry on 5xx server errors
        if (statusCode >= 500 && statusCode < 600) return true;

        // Retry on rate limit (429)
        if (statusCode === 429) return true;

        return false;
    }

    private async retryRequest<T>(
        method: string,
        endpoint: string,
        body: unknown,
        options: RequestInit,
        attempt: number
    ): Promise<T> {
        const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`[ProofRails SDK] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request<T>(method, endpoint, body, options, attempt + 1);
    }

    private extractRateLimitInfo(response: Response): void {
        const limit = response.headers.get('X-RateLimit-Limit');
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const reset = response.headers.get('X-RateLimit-Reset');

        if (limit && remaining && reset) {
            const resetTimestamp = parseInt(reset, 10);
            this.rateLimitInfo = {
                limit: parseInt(limit, 10),
                remaining: parseInt(remaining, 10),
                reset: resetTimestamp,
                resetDate: new Date(resetTimestamp * 1000)
            };
        }
    }

    setApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    setAdminToken(adminToken: string): void {
        this.adminToken = adminToken;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }
}
