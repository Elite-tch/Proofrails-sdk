/**
 * Template examples - Beginner-friendly receipt creation
 */

import ProofRails from '../src';

async function templateExamples() {
    const proofrails = new ProofRails({
        apiKey: 'your-api-key-here',
    });

    // Example 1: Payment Receipt
    console.log('Example 1: Payment Receipt');
    const payment = await proofrails.templates.payment({
        amount: 150,
        from: 'Alice Johnson',
        to: 'Bob Smith',
        purpose: 'Website design services',
        transactionHash: '0xabc123',
    });
    console.log('✅ Payment receipt:', payment.id);

    // Example 2: Donation Receipt
    console.log('\nExample 2: Donation Receipt');
    const donation = await proofrails.templates.donation({
        amount: 500,
        donor: 'John Doe',
        organization: 'Save the Children',
        campaign: 'Education Fund 2024',
        transactionHash: '0xdef456',
    });
    console.log('✅ Donation receipt:', donation.id);

    // Example 3: Escrow Release
    console.log('\nExample 3: Escrow Release');
    const escrow = await proofrails.templates.escrow({
        amount: 2500,
        buyer: 'Alice Corp',
        seller: 'Bob LLC',
        escrowId: 'ESC-2024-001',
        releaseReason: 'Project milestone 2 completed',
        transactionHash: '0xghi789',
    });
    console.log('✅ Escrow receipt:', escrow.id);

    // Example 4: Grant Disbursement
    console.log('\nExample 4: Grant Disbursement');
    const grant = await proofrails.templates.grant({
        amount: 10000,
        grantee: 'University Research Lab',
        grantor: 'National Science Foundation',
        grantId: 'NSF-2024-12345',
        purpose: 'AI safety research',
        transactionHash: '0xjkl012',
    });
    console.log('✅ Grant receipt:', grant.id);

    // Example 5: Refund
    console.log('\nExample 5: Refund');
    const refund = await proofrails.templates.refund({
        amount: 75,
        originalPayment: payment.id,
        reason: 'Customer requested cancellation',
        customer: 'Jane Smith',
        transactionHash: '0xmno345',
    });
    console.log('✅ Refund receipt:', refund.id);
}

templateExamples().catch(console.error);
