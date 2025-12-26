/**
 * Common types used across the SDK
 */

export type Network = 'coston2' | 'flare';

export type ReceiptStatus = 'pending' | 'anchored' | 'failed';

export interface SDKConfig {
    /** Your ProofRails API key */
    apiKey?: string;
    /** Admin token for administrative operations */
    adminToken?: string;
    /** Network to use (coston2 or flare) */
    network?: Network;
    /** Base URL of the middleware (optional, defaults to production) */
    baseUrl?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Number of retry attempts for failed requests (default: 3) */
    retries?: number;
    /** Delay between retries in milliseconds (default: 1000) */
    retryDelay?: number;
}

export interface APIResponse<T> {
    data: T;
    success: boolean;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export class ProofRailsError extends Error {
    constructor(
        message: string,
        public code?: string,
        public statusCode?: number,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ProofRailsError';
    }
}
