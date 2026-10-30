/**
 * Payment template - For simple payments between two parties
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';
import type { Network } from '../types/common';

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
    /** Sender's wallet address (optional, defaults to from) */
    senderWallet?: string;
    /** Receiver's wallet address (optional, defaults to to) */
    receiverWallet?: string;
    /** Chain/network (optional, defaults to configured SDK network) */
    chain?: Network;
    /** Currency (optional, defaults to native network currency) */
    currency?: string;
}

export async function createPaymentReceipt(
    receiptsModule: ReceiptsModule,
    options: PaymentTemplateOptions,
    defaultNetwork: Network = 'coston2'
): Promise<Receipt> {
    const chain = options.chain || defaultNetwork || 'coston2';
    const currency = options.currency || (chain === 'coston2' ? 'C2FLR' : chain === 'base' ? 'USDC' : 'FLR');

    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain,
        amount: options.amount,
        currency,
        sender: options.senderWallet || options.from,
        receiver: options.receiverWallet || options.to,
        reference: `Payment: ${options.purpose} (Tx: ${options.transactionHash})`,
    });
}
