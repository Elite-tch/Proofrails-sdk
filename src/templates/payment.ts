/**
 * Payment template - For simple payments between two parties
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';

export interface PaymentTemplateOptions {
    /** Payment amount */
    amount: number;
    /** Who is sending the payment */
    from: string;
    /** Who is receiving the payment */
    to: string;
    /** What the payment is for */
    purpose: string;
    /** Blockchain transaction hash */
    transactionHash: string;
    /** Sender's wallet address (optional, defaults to transaction sender) */
    senderWallet?: string;
    /** Receiver's wallet address (optional, defaults to transaction receiver) */
    receiverWallet?: string;
    /** Chain/network (optional, auto-detected if not provided) */
    chain?: 'coston2' | 'flare';
    /** Currency (optional, auto-detected if not provided) */
    currency?: string;
}

export async function createPaymentReceipt(
    receiptsModule: ReceiptsModule,
    options: PaymentTemplateOptions
): Promise<Receipt> {
    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain: options.chain || 'coston2', // Smart default
        amount: options.amount,
        currency: options.currency || 'C2FLR', // Smart default
        sender: options.senderWallet || options.from,
        receiver: options.receiverWallet || options.to,
        reference: `Payment: ${options.purpose} (Tx: ${options.transactionHash})`,
    });
}
