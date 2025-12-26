/**
 * Live updates example using Server-Sent Events
 */

import ProofRails from '../src';

async function liveUpdatesExample() {
    const proofrails = new ProofRails({
        apiKey: 'your-api-key-here',
    });

    // Create a receipt
    console.log('Creating receipt...');
    const receipt = await proofrails.templates.payment({
        amount: 100,
        from: 'Alice',
        to: 'Bob',
        purpose: 'Test payment',
        transactionHash: '0x123abc',
    });

    console.log('Receipt created:', receipt.id);
    console.log('Initial status:', receipt.status);
    console.log('\nListening for updates...');

    // Listen to real-time updates
    const listener = proofrails.events.listen(receipt.id, (update) => {
        console.log('\n📡 Update received:');
        console.log('Status:', update.status);
        console.log('Timestamp:', update.timestamp);

        if (update.status === 'anchored') {
            console.log('✅ Receipt is now anchored on-chain!');
            console.log('Anchor TX:', update.anchorTx);
            console.log('Bundle Hash:', update.bundleHash);

            // Stop listening after anchoring
            console.log('\nStopping listener...');
            listener.stop();
        }
    });

    // Keep the process running
    console.log('\nPress Ctrl+C to exit');
}

liveUpdatesExample().catch(console.error);
