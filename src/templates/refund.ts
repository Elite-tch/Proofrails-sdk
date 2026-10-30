/**
 * Refund template - For refunds
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';
import type { Network } from '../types/common';

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
    /** Chain/network (optional, defaults to configured SDK network) */
    chain?: Network;
    /** Currency (optional, defaults to native network currency) */
    currency?: string;
}

export async function createRefundReceipt(
    receiptsModule: ReceiptsModule,
    options: RefundTemplateOptions,
    defaultNetwork: Network = 'coston2'
): Promise<Receipt> {
    const chain = options.chain || defaultNetwork || 'coston2';
    const currency = options.currency || (chain === 'coston2' ? 'C2FLR' : chain === 'base' ? 'USDC' : 'FLR');

    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain,
        amount: options.amount,
        currency,
        sender: options.businessWallet || 'Business',
        receiver: options.customerWallet || options.customer,
        reference: `Refund: ${options.originalPayment} - ${options.reason} (Customer: ${options.customer})`,
    });
}
