/**
 * Grant template - For grant disbursements
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';

export interface GrantTemplateOptions {
    /** Grant amount */
    amount: number;
    /** Name of the grantee (recipient) */
    grantee: string;
    /** Name of the grantor (funder) */
    grantor: string;
    /** Grant identifier */
    grantId: string;
    /** Purpose of the grant */
    purpose: string;
    /** Blockchain transaction hash */
    transactionHash: string;
    /** Grantor's wallet address (optional) */
    grantorWallet?: string;
    /** Grantee's wallet address (optional) */
    granteeWallet?: string;
}

export async function createGrantReceipt(
    receiptsModule: ReceiptsModule,
    options: GrantTemplateOptions
): Promise<Receipt> {
    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain: 'coston2',
        amount: options.amount,
        currency: 'FLR',
        sender: options.grantorWallet || options.grantor,
        receiver: options.granteeWallet || options.grantee,
        reference: `Grant: ${options.grantId} - ${options.purpose} (Grantor: ${options.grantor}, Grantee: ${options.grantee})`,
    });
}
