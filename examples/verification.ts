/**
 * Verification examples
 */

import ProofRails from '../src';

async function verificationExamples() {
    const proofrails = new ProofRails({
        apiKey: 'your-api-key-here',
    });

    // Create a receipt first
    const receipt = await proofrails.templates.payment({
        amount: 100,
        from: 'Alice',
        to: 'Bob',
        purpose: 'Test',
        transactionHash: '0x123',
    });

    console.log('Receipt created:', receipt.id);

    // Example 1: Verify by receipt ID
    console.log('\nExample 1: Verify by receipt ID');
    const verification1 = await proofrails.verify.byReceiptId(receipt.id);
    console.log('Valid:', verification1.valid);
    console.log('On-chain:', verification1.onChain);
    console.log('Bundle Hash:', verification1.bundleHash);

    if (verification1.anchorTx) {
        console.log('Anchor TX:', verification1.anchorTx);
    }

    // Example 2: Verify by bundle hash (after anchoring)
    if (verification1.bundleHash) {
        console.log('\nExample 2: Verify by bundle hash');
        const verification2 = await proofrails.verify.byHash(verification1.bundleHash);
        console.log('Valid:', verification2.valid);
        console.log('On-chain:', verification2.onChain);
    }

    // Example 3: Get verification proof
    console.log('\nExample 3: Get verification proof');
    try {
        const proof = await proofrails.verify.getProof(receipt.id);
        console.log('Receipt ID:', proof.receiptId);
        console.log('Bundle Hash:', proof.bundleHash);
        console.log('Anchor TX:', proof.anchorTx);
        console.log('Block Number:', proof.blockNumber);
        console.log('Timestamp:', proof.timestamp);
        console.log('Network:', proof.network);
    } catch (error) {
        console.log('Proof not yet available (receipt may not be anchored)');
    }

    // Example 4: Download and verify artifacts
    console.log('\nExample 4: Download artifacts');
    const artifacts = await proofrails.receipts.getArtifacts(receipt.id);
    console.log('ISO XML (pain.001):', artifacts.pain001Url);
    console.log('Evidence Bundle:', artifacts.bundleUrl);
    console.log('Manifest:', artifacts.manifestUrl);

    if (artifacts.bundleUrl) {
        console.log('\nVerifying bundle by URL...');
        const verification3 = await proofrails.verify.byUrl(artifacts.bundleUrl);
        console.log('Valid:', verification3.valid);
    }
}

verificationExamples().catch(console.error);
