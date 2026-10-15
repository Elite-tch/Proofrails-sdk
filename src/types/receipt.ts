/**
 * Receipt related types
 */

import type { Network, ReceiptStatus } from './common';

export interface CreateReceiptOptions {
    transactionHash: string;
    chain: Network;
    amount: string | number;
    currency: string;
    sender: string;
    receiver: string;
    reference: string;
    callbackUrl?: string;
    /** Free-form context retained with the receipt and webhook events. */
    metadata?: Record<string, unknown>;
    /** Labels used when filtering receipts. */
    tags?: string[];
    /** Client-generated key for safe retrying of write requests. */
    idempotencyKey?: string;
}

export interface Receipt {
    id: string;
    status: ReceiptStatus;
    transactionHash: string;
    chain: Network;
    amount: string;
    currency: string;
    sender: string;
    receiver: string;
    reference: string;
    createdAt: string;
    anchoredAt?: string;
    anchorTx?: string;
    bundleHash?: string;
    projectId?: string;
    operationId?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
    bundleUrl?: string; // from API
    xmlUrl?: string;    // from API
    // UI Helpers
    onChain?: boolean;
    valid?: boolean;
}

export interface ReceiptArtifacts {
    pain001Url?: string;
    pain002Url?: string;
    pain007Url?: string;
    pain008Url?: string;
    camt054Url?: string;
    bundleUrl?: string;
    manifestUrl?: string;
}

export interface ListReceiptsOptions {
    /** Legacy alias for pageSize. */
    limit?: number;
    page?: number;
    pageSize?: number;
    status?: ReceiptStatus;
    chain?: Network;
    reference?: string;
    since?: string;
    until?: string;
    tags?: string[];
    scope?: 'mine' | 'all';
    cursor?: string;
}

export interface ReceiptUpdate {
    id: string;
    status: ReceiptStatus;
    anchorTx?: string;
    bundleHash?: string;
    timestamp: string;
}
