/**
 * Core HTTP client for ProofRails API
 */

import type { SDKConfig, Network } from './types/common';
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
    private network: Network;
    private timeout: number;
    private retries: number;
    private retryDelay: number;
    private flareRpcUrl: string;
    private signer?: any;
    private privateKey?: string;
    private rateLimitInfo: RateLimitInfo | null = null;

    constructor(config: SDKConfig = {}) {
        // Read from environment variable if available
        const envBaseUrl = typeof process !== 'undefined' && (process.env?.PROOFRAILS_BASE_URL || process.env?.NEXT_PUBLIC_PROOFRAILS_BASE_URL);
        const envFlareRpc = typeof process !== 'undefined' && process.env?.FLARE_RPC_URL;

        // Default endpoint
        const defaultBaseUrl = 'http://localhost:8000';

        this.baseUrl = config.baseUrl || envBaseUrl || defaultBaseUrl;
        this.apiKey = config.apiKey;
        this.adminToken = config.adminToken;
        this.network = config.network || 'coston2';
        this.timeout = config.timeout || 30000;
        this.retries = config.retries ?? 3; // Default 3 retries
        this.retryDelay = config.retryDelay ?? 1000; // Default 1s delay
        this.flareRpcUrl = config.flareRpcUrl || envFlareRpc || 'https://flare-api.flare.network/ext/C/rpc';
        this.signer = config.signer;
        this.privateKey = config.privateKey;
    }

    getRateLimitInfo(): RateLimitInfo | null {
        return this.rateLimitInfo;
    }

    getNetwork(): Network {
        return this.network;
    }

    setNetwork(network: Network): void {
        this.network = network;
    }

    getFlareRpcUrl(): string {
        return this.flareRpcUrl;
    }

    setFlareRpcUrl(url: string): void {
        this.flareRpcUrl = url;
    }

    getSigner(): any {
        return this.signer;
    }

    setSigner(signer: any): void {
        this.signer = signer;
    }

    getPrivateKey(): string | undefined {
        return this.privateKey;
    }

    setPrivateKey(key: string): void {
        this.privateKey = key;
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

    async requestRaw(
        method: string,
        endpoint: string,
        body?: unknown,
        options: RequestInit = {}
    ): Promise<Response> {
        const url = `${this.baseUrl}${endpoint}`;
        const { headers: optionHeaders, signal: optionSignal, ...restOptions } = options;

        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((optionHeaders as Record<string, string>) || {}),
        };

        if (this.apiKey && !requestHeaders['X-API-Key']) {
            requestHeaders['X-API-Key'] = this.apiKey;
        }

        if (this.adminToken && !requestHeaders['Authorization']) {
            requestHeaders['Authorization'] = `Bearer ${this.adminToken}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...restOptions,
                method,
                headers: requestHeaders,
                body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
                signal: optionSignal || controller.signal,
            });
            clearTimeout(timeoutId);
            this.extractRateLimitInfo(response);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async download(endpoint: string, options: RequestInit = {}): Promise<Blob> {
        const { headers: optionHeaders, method = 'GET', body, ...rest } = options;
        const requestHeaders: Record<string, string> = {
            ...((optionHeaders as Record<string, string>) || {}),
        };

        if (this.apiKey && !requestHeaders['X-API-Key']) {
            requestHeaders['X-API-Key'] = this.apiKey;
        }

        if (this.adminToken && !requestHeaders['Authorization']) {
            requestHeaders['Authorization'] = `Bearer ${this.adminToken}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...rest,
            method,
            headers: requestHeaders,
            body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new ProofRailsError(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`, undefined, response.status);
        }
        return response.blob();
    }

    private async request<T>(
        method: string,
        endpoint: string,
        body?: unknown,
        options: RequestInit = {},
        attempt: number = 0
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const { headers: optionHeaders, signal: optionSignal, ...restOptions } = options;

        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((optionHeaders as Record<string, string>) || {}),
        };

        if (this.apiKey && !requestHeaders['X-API-Key']) {
            requestHeaders['X-API-Key'] = this.apiKey;
        }

        if (this.adminToken && !requestHeaders['Authorization']) {
            requestHeaders['Authorization'] = `Bearer ${this.adminToken}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...restOptions,
                method,
                headers: requestHeaders,
                body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
                signal: optionSignal || controller.signal,
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

                // Retry on 5xx or 429 ONLY if safe (GET) or with enforced idempotency key
                if (this.shouldRetry(response.status, attempt, method, requestHeaders)) {
                    return this.retryRequest(method, endpoint, body, options, attempt);
                }

                throw error;
            }

            const contentType = response.headers.get('content-type') || '';
            return (contentType.includes('application/json')
                ? await response.json()
                : await response.text()) as T;
        } catch (error) {
            clearTimeout(timeoutId);

            // If it's already a ProofRailsError, it was an HTTP error thrown above
            // Do NOT retry HTTP 4xx errors as network errors!
            if (error instanceof ProofRailsError) {
                throw error;
            }

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    if (this.shouldRetry(0, attempt, method, requestHeaders)) {
                        return this.retryRequest(method, endpoint, body, options, attempt);
                    }
                    throw new ProofRailsError(`Request timeout after ${this.timeout}ms`, 'TIMEOUT');
                }

                // Retry on true network errors ONLY if safe or idempotent
                if (this.shouldRetry(0, attempt, method, requestHeaders)) {
                    return this.retryRequest(method, endpoint, body, options, attempt);
                }

                throw new ProofRailsError(error.message, 'NETWORK_ERROR');
            }

            throw new ProofRailsError('Unknown error occurred', 'UNKNOWN_ERROR');
        }
    }

    private isIdempotent(method: string, headers: Record<string, string>): boolean {
        // Safe HTTP methods are naturally idempotent
        const upperMethod = method.toUpperCase();
        if (upperMethod === 'GET' || upperMethod === 'HEAD' || upperMethod === 'OPTIONS') {
            return true;
        }

        // Check for idempotency key header (case-insensitive)
        for (const [key, value] of Object.entries(headers)) {
            if (key.toLowerCase() === 'idempotency-key' && value && value.trim().length > 0) {
                return true;
            }
        }

        return false;
    }

    private shouldRetry(
        statusCode: number,
        attempt: number,
        method: string,
        headers: Record<string, string>
    ): boolean {
        if (attempt >= this.retries) return false;

        // Never retry mutations (POST/PUT/DELETE) without enforced idempotency
        if (!this.isIdempotent(method, headers)) {
            return false;
        }

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
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request<T>(method, endpoint, body, options, attempt + 1);
    }

    private extractRateLimitInfo(response: Response): void {
        const limit = response.headers.get('X-RateLimit-Limit');
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const reset = response.headers.get('X-RateLimit-Reset');

        if (limit !== null || remaining !== null || reset !== null) {
            const resetTimestamp = reset ? parseInt(reset, 10) : 0;
            this.rateLimitInfo = {
                limit: limit ? parseInt(limit, 10) : 0,
                remaining: remaining ? parseInt(remaining, 10) : 0,
                reset: resetTimestamp,
                resetDate: new Date(resetTimestamp ? resetTimestamp * 1000 : Date.now()),
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
