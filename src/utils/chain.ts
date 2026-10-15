/**
 * Smart auto-detection utilities
 */

import type { Network } from '../types/common';

export interface ChainContracts {
    evidenceAnchor: string;
    x402Facilitator?: string;
    usdt0?: string;
}

export interface ChainInfo {
    id: number;
    name: string;
    network: Network;
    currency: string;
    rpcUrl: string;
    explorerUrl: string;
    contracts: ChainContracts;
}

export const SUPPORTED_CHAINS: Record<number, ChainInfo> = {
    14: {
        id: 14,
        name: 'Flare',
        network: 'flare',
        currency: 'FLR',
        rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
        explorerUrl: 'https://flare-explorer.flare.network',
        contracts: {
            evidenceAnchor: '0x235f83a74fc9D759D648eC533d2c06712F3Ca5EA',
            x402Facilitator: '0xa78F15ee5a1Ff1D89F6AD782a5f9b81f7C2aA4aE',
            usdt0: '0xe7cd86e13AC4309349F30B3435a9d337750fC82D',
        }
    },
    114: {
        id: 114,
        name: 'Coston2',
        network: 'coston2',
        currency: 'C2FLR',
        rpcUrl: 'https://coston2-api.flare.network/ext/C/rpc',
        explorerUrl: 'https://coston2-explorer.flare.network',
        contracts: {
            evidenceAnchor: '0x0690d8cFb1897c12B2C0b34660edBDE4E20ff4d8',
        }
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
 * Alias for detectNetwork
 */
export const detectNetworkFromChainId = detectNetwork;

/**
 * Get EvidenceAnchor contract address for a given chain ID or network name
 */
export function getContractAddress(chain: number | Network): string {
    const chainId = typeof chain === 'number' ? chain : (chain === 'flare' ? 14 : 114);
    const info = SUPPORTED_CHAINS[chainId];
    return info?.contracts?.evidenceAnchor || '';
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
export function getExplorerUrl(chain: number | Network, txHash: string): string {
    const chainId = typeof chain === 'number' ? chain : (chain === 'flare' ? 14 : 114);
    const info = SUPPORTED_CHAINS[chainId];
    if (!info) return '';

    return `${info.explorerUrl}/tx/${txHash}`;
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(chain: number | Network, address: string): string {
    const chainId = typeof chain === 'number' ? chain : (chain === 'flare' ? 14 : 114);
    const info = SUPPORTED_CHAINS[chainId];
    if (!info) return '';

    return `${info.explorerUrl}/address/${address}`;
}
