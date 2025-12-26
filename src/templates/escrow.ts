/**
 * Escrow template - For escrow releases
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';

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
}

export async function createEscrowReceipt(
    receiptsModule: ReceiptsModule,
    options: EscrowTemplateOptions
): Promise<Receipt> {
    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain: 'coston2',
        amount: options.amount,
        currency: 'FLR',
        sender: options.buyerWallet || options.buyer,
        receiver: options.sellerWallet || options.seller,
        reference: `Escrow Release: ${options.escrowId} - ${options.releaseReason} (Buyer: ${options.buyer}, Seller: ${options.seller})`,
    });
}
