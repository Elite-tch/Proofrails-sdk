/**
 * ProofRails SDK
 * 
 * Beginner-friendly SDK for creating blockchain-verifiable ISO 20022 payment receipts
 * 
 * @example
 * ```typescript
 * import ProofRails from '@proofrails/sdk';
 * 
 * // Create a new project
 * const { client, apiKey } = await ProofRails.createProject({ label: 'My App' });
 * 
 * // Or use existing API key
 * const proofrails = new ProofRails({ apiKey: 'your-api-key' });
 * 
 * // Create a payment receipt (beginner-friendly)
 * const receipt = await proofrails.templates.payment({
 *   amount: 100,
 *   from: 'Alice',
 *   to: 'Bob',
 *   purpose: 'Freelance work',
 *   transactionHash: '0x123...'
 * });
 * 
 * // Get receipt details
 * const details = await proofrails.receipts.get(receipt.id);
 * 
 * // Verify receipt
 * const verification = await proofrails.verify.byReceiptId(receipt.id);
 * ```
 */

export { ProofRails, ProofRails as default } from './sdk';

// Export all types
export * from './types';
export type { Receipt as SDKReceipt } from './types/receipt';

// Export template option types
export type {
    PaymentTemplateOptions,
    DonationTemplateOptions,
    EscrowTemplateOptions,
    GrantTemplateOptions,
    RefundTemplateOptions,
} from './templates';

// Export error class
export { ProofRailsError } from './types/common';

// Export utility functions
export * from './utils';

// Export client types
export type { RateLimitInfo } from './client';

