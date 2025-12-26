/**
 * Donation template - For charitable donations
 */

import type { ReceiptsModule } from '../modules/receipts';
import type { Receipt } from '../types/receipt';

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
}

export async function createDonationReceipt(
    receiptsModule: ReceiptsModule,
    options: DonationTemplateOptions
): Promise<Receipt> {
    return receiptsModule.create({
        transactionHash: options.transactionHash,
        chain: 'coston2',
        amount: options.amount,
        currency: 'FLR',
        sender: options.donorWallet || options.donor,
        receiver: options.organizationWallet || options.organization,
        reference: `Donation: ${options.campaign} (Donor: ${options.donor}, Organization: ${options.organization})`,
    });
}
