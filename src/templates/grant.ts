/**
 * Grant template - For grant disbursements
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';
import type { Network } from '../types/common';

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
    /** Chain/network (optional, defaults to configured SDK network) */
    chain?: Network;
    /** Currency (optional, defaults to native network currency) */
    currency?: string;
}

export async function createGrantReceipt(
    receiptsModule: ReceiptsModule,
    options: GrantTemplateOptions,
    defaultNetwork: Network = 'coston2'
): Promise<Receipt> {
    const chain = options.chain || defaultNetwork || 'coston2';
    const currency = options.currency || (chain === 'coston2' ? 'C2FLR' : chain === 'base' ? 'USDC' : 'FLR');

    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain,
        amount: options.amount,
        currency,
        sender: options.grantorWallet || options.grantor,
        receiver: options.granteeWallet || options.grantee,
        reference: `Grant: ${options.grantId} - ${options.purpose} (Grantor: ${options.grantor}, Grantee: ${options.grantee})`,
    });
}
