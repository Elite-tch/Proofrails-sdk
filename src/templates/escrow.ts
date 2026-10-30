/**
 * Escrow template - For escrow releases
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';
import type { Network } from '../types/common';

export interface EscrowTemplateOptions {
    /** Amount being released from escrow */
    amount: number;
    /** Buyer's name */
    buyer: string;
    /** Seller's name */
    seller: string;
    /** Escrow identifier */
    escrowId: string;
    /** Reason for release */
    releaseReason: string;
    /** Blockchain transaction hash */
    transactionHash: string;
    /** Buyer's wallet address (optional) */
    buyerWallet?: string;
    /** Seller's wallet address (optional) */
    sellerWallet?: string;
    /** Chain/network (optional, defaults to configured SDK network) */
    chain?: Network;
    /** Currency (optional, defaults to native network currency) */
    currency?: string;
}

export async function createEscrowReceipt(
    receiptsModule: ReceiptsModule,
    options: EscrowTemplateOptions,
    defaultNetwork: Network = 'coston2'
): Promise<Receipt> {
    const chain = options.chain || defaultNetwork || 'coston2';
    const currency = options.currency || (chain === 'coston2' ? 'C2FLR' : chain === 'base' ? 'USDC' : 'FLR');

    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain,
        amount: options.amount,
        currency,
        sender: options.buyerWallet || options.buyer,
        receiver: options.sellerWallet || options.seller,
        reference: `Escrow Release: ${options.escrowId} - ${options.releaseReason} (Buyer: ${options.buyer}, Seller: ${options.seller})`,
    });
}
