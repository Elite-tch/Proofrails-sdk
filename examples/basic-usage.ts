/**
 * Basic usage examples
 */

import ProofRails from '../src';

async function basicExamples() {
    // Example 1: Create a new project
    console.log('Example 1: Creating a new project...');
    const { client, apiKey, projectId } = await ProofRails.createProject({
        label: 'My First Project',
    });
    console.log('✅ Project created!');
    console.log('API Key:', apiKey);
    console.log('Project ID:', projectId);

    // Example 2: Use existing API key
    console.log('\nExample 2: Using existing API key...');
    const proofrails = new ProofRails({
        apiKey: 'your-api-key-here',
        network: 'coston2',
    });

    // Example 3: Create a simple payment receipt
    console.log('\nExample 3: Creating a payment receipt...');
    const receipt = await proofrails.templates.payment({
        amount: 100,
        from: 'Alice',
        to: 'Bob',
        purpose: 'Freelance web development',
        transactionHash: '0x1234567890abcdef',
    });
    console.log('✅ Receipt created!');
    console.log('Receipt ID:', receipt.id);
    console.log('Status:', receipt.status);

    // Example 4: Get receipt details
    console.log('\nExample 4: Getting receipt details...');
    const details = await proofrails.receipts.get(receipt.id);
    console.log('Amount:', details.amount);
    console.log('Sender:', details.sender);
    console.log('Receiver:', details.receiver);

    // Example 5: List all receipts
    console.log('\nExample 5: Listing receipts...');
    const { items, total } = await proofrails.receipts.list({ limit: 5 });
    console.log(`Found ${total} receipts`);
    items.forEach((r) => {
        console.log(`- ${r.id}: ${r.amount} ${r.currency}`);
    });

    // Example 6: Verify receipt
    console.log('\nExample 6: Verifying receipt...');
    const verification = await proofrails.verify.byReceiptId(receipt.id);
    console.log('Valid:', verification.valid);
    console.log('On-chain:', verification.onChain);
    if (verification.anchorTx) {
        console.log('Anchor TX:', verification.anchorTx);
    }
}

// Run examples
basicExamples().catch(console.error);
