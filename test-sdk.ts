import { ProofRails } from './src';

async function main() {
    console.log('🚀 Initializing ProofRails SDK pointing to local backend...\n');

    const proofrails = new ProofRails({
        baseUrl: 'http://127.0.0.1:8000',
        apiKey: 'proofrails-local-dev-key', // Set in middleware-ISO-v2.2-and-x402/.env
    });

    // 1. Test listing existing receipts
    console.log('1️⃣ Fetching receipts list...');
    try {
        const list = await proofrails.receipts.list({ limit: 5 });
        console.log(`✅ Success! Total receipts in DB: ${list.total}`);
    } catch (err: any) {
        console.error('❌ Failed to fetch receipts:', err.message);
    }

    // 2. Test creating a new receipt using the payment template
    console.log('\n2️⃣ Creating a new ISO 20022 payment receipt...');
    try {
        const receipt = await proofrails.templates.payment({
            amount: 50.00,
            from: 'Alice',
            to: 'Bob',
            purpose: 'SDK Local Test Payment',
            transactionHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            senderWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            receiverWallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            chain: 'coston2',
            currency: 'C2FLR',
        });

        console.log('✅ Receipt created successfully!');
        console.log('   Receipt ID:', receipt.id);
        console.log('   Status:', receipt.status);
        console.log('   Reference:', receipt.reference);

        // 3. Test retrieving the created receipt details
        console.log('\n3️⃣ Fetching details for the created receipt...');
        const details = await proofrails.receipts.get(receipt.id);
        console.log('✅ Retrieved receipt details:');
        console.log(`   ID: ${details.id}`);
        console.log(`   Amount: ${details.amount} ${details.currency}`);
        console.log(`   Sender: ${details.sender}`);
        console.log(`   Receiver: ${details.receiver}`);

    } catch (err: any) {
        console.error('❌ Failed to create receipt:', err.message);
    }

    console.log('\n✨ SDK local test completed.');
}

main().catch(console.error);
