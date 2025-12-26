/**
 * Refund template - For refunds
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';

export interface RefundTemplateOptions {
    /** Refund amount */
    amount: number;
    /** Original receipt ID being refunded */
    originalPayment: string;
    /** Reason for refund */
    reason: string;
    /** Customer name */
    customer: string;
    /** Blockchain transaction hash */
    transactionHash: string;
    /** Business wallet address (optional) */
    businessWallet?: string;
    /** Customer wallet address (optional) */
    customerWallet?: string;
}

export async function createRefundReceipt(
    receiptsModule: ReceiptsModule,
    options: RefundTemplateOptions
): Promise<Receipt> {
    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain: 'coston2',
        amount: options.amount,
        currency: 'FLR',
        sender: options.businessWallet || 'Business',
        receiver: options.customerWallet || options.customer,
        reference: `Refund: ${options.originalPayment} - ${options.reason} (Customer: ${options.customer})`,
    });
}
