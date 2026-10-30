/**
 * Donation template - For charitable donations
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';
import type { Network } from '../types/common';

export interface DonationTemplateOptions {
    /** Donation amount */
    amount: number;
    /** Name of the donor */
    donor: string;
    /** Name of the organization receiving the donation */
    organization: string;
    /** Campaign or cause name */
    campaign: string;
    /** Blockchain transaction hash */
    transactionHash: string;
    /** Donor's wallet address (optional) */
    donorWallet?: string;
    /** Organization's wallet address (optional) */
    organizationWallet?: string;
    /** Chain/network (optional, defaults to configured SDK network) */
    chain?: Network;
    /** Currency (optional, defaults to native network currency) */
    currency?: string;
}

export async function createDonationReceipt(
    receiptsModule: ReceiptsModule,
    options: DonationTemplateOptions,
    defaultNetwork: Network = 'coston2'
): Promise<Receipt> {
    const chain = options.chain || defaultNetwork || 'coston2';
    const currency = options.currency || (chain === 'coston2' ? 'C2FLR' : chain === 'base' ? 'USDC' : 'FLR');

    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain,
        amount: options.amount,
        currency,
        sender: options.donorWallet || options.donor,
        receiver: options.organizationWallet || options.organization,
        reference: `Donation: ${options.campaign} (Donor: ${options.donor}, Organization: ${options.organization})`,
    });
}
