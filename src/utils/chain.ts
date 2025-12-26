/**
 * Smart auto-detection utilities
 */

import type { Network } from '../types/common';

export interface ChainInfo {
    id: number;
    name: string;
    network: Network;
    currency: string;
    rpcUrl: string;
    explorerUrl: string;
}

export const SUPPORTED_CHAINS: Record<number, ChainInfo> = {
    14: {
        id: 14,
        name: 'Flare',
        network: 'flare',
        currency: 'FLR',
        rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
        explorerUrl: 'https://flare-explorer.flare.network'
    },
    114: {
        id: 114,
        name: 'Coston2',
        network: 'coston2',
        currency: 'C2FLR',
        rpcUrl: 'https://coston2-api.flare.network/ext/C/rpc',
        explorerUrl: 'https://coston2-explorer.flare.network'
    }
};

/**
 * Auto-detect network from chain ID
 */
export function detectNetwork(chainId?: number): Network {
    if (!chainId) return 'coston2'; // Default to testnet

    const chain = SUPPORTED_CHAINS[chainId];
    return chain?.network || 'coston2';
}

/**
 * Auto-detect currency from chain ID
 */
export function detectCurrency(chainId?: number): string {
    if (!chainId) return 'C2FLR';

    const chain = SUPPORTED_CHAINS[chainId];
    return chain?.currency || 'C2FLR';
}

/**
 * Get chain info from chain ID
 */
export function getChainInfo(chainId: number): ChainInfo | null {
    return SUPPORTED_CHAINS[chainId] || null;
}

/**
 * Check if chain is supported
 */
export function isSupportedChain(chainId: number): boolean {
    return chainId in SUPPORTED_CHAINS;
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(chainId: number, txHash: string): string {
    const chain = SUPPORTED_CHAINS[chainId];
    if (!chain) return '';

    return `${chain.explorerUrl}/tx/${txHash}`;
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(chainId: number, address: string): string {
    const chain = SUPPORTED_CHAINS[chainId];
    if (!chain) return '';

    return `${chain.explorerUrl}/address/${address}`;
}
