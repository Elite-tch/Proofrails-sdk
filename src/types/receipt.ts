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
    limit?: number;
    page?: number;
    status?: ReceiptStatus;
}

export interface ReceiptUpdate {
    id: string;
    status: ReceiptStatus;
    anchorTx?: string;
    bundleHash?: string;
    timestamp: string;
}
