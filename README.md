# ProofRails SDK

> **Beginner-friendly SDK for creating blockchain-verifiable ISO 20022 payment receipts**

Create compliant, auditable payment receipts with just a few lines of code. No blockchain expertise required!

## ✨ Features

- 🎯 **Zero coding knowledge required** - Use simple templates
- 📝 **ISO 20022 compliant** - Generates standard banking messages
- ⛓️ **Blockchain-verified** - Receipts anchored on Flare blockchain
- 🔒 **Tamper-proof** - Cryptographic evidence bundles
- 🚀 **Real-time updates** - Live receipt status via SSE
- 📦 **Works everywhere** - TypeScript, JavaScript, Node.js, browsers

## 📦 Installation

```bash
npm install @proofrails/sdk
# or
yarn add @proofrails/sdk
```

## 🚀 Quick Start

### Option 1: Create New Project (Easiest)

```javascript
import ProofRails from '@proofrails/sdk';

// Create a new project automatically
const { client, apiKey, projectId } = await ProofRails.createProject({
  label: 'My App'
});

console.log('Your API Key:', apiKey); // Save this!
console.log('Your Project ID:', projectId);
```

### Option 2: Use Existing API Key

```javascript
import ProofRails from '@proofrails/sdk';

const proofrails = new ProofRails({
  apiKey: 'your-api-key-here'
});
```

## 🎨 Templates (Beginner-Friendly)

### Payment Receipt

```javascript
const receipt = await proofrails.templates.payment({
  amount: 100,
  from: 'Alice',
  to: 'Bob',
  purpose: 'Freelance web development',
  transactionHash: '0x123...'
});

console.log('Receipt ID:', receipt.id);
console.log('Status:', receipt.status);
```

### Donation Receipt

```javascript
const receipt = await proofrails.templates.donation({
  amount: 50,
  donor: 'John Doe',
  organization: 'Red Cross',
  campaign: 'Disaster Relief 2024',
  transactionHash: '0x456...'
});
```

### Escrow Release

```javascript
const receipt = await proofrails.templates.escrow({
  amount: 1000,
  buyer: 'Alice',
  seller: 'Bob',
  escrowId: 'ESC-2024-001',
  releaseReason: 'Milestone 1 completed',
  transactionHash: '0x789...'
});
```

### Grant Disbursement

```javascript
const receipt = await proofrails.templates.grant({
  amount: 5000,
  grantee: 'Research Lab',
  grantor: 'Science Foundation',
  grantId: 'GR-2024-001',
  purpose: 'Climate change research',
  transactionHash: '0xabc...'
});
```

### Refund

```javascript
const receipt = await proofrails.templates.refund({
  amount: 25,
  originalPayment: 'receipt-id-123',
  reason: 'Product returned',
  customer: 'Jane Smith',
  transactionHash: '0xdef...'
});
```

## 📚 Core Operations

### Get Receipt

```javascript
const receipt = await proofrails.receipts.get('receipt-id');

console.log(receipt.status); // 'pending' or 'anchored'
console.log(receipt.amount);
console.log(receipt.anchorTx); // Blockchain transaction (if anchored)
```

### List Receipts

```javascript
const { items, total } = await proofrails.receipts.list({
  limit: 10,
  status: 'anchored'
});

items.forEach(receipt => {
  console.log(receipt.id, receipt.amount);
});
```

### Download Artifacts

```javascript
const artifacts = await proofrails.receipts.getArtifacts('receipt-id');

console.log('ISO XML:', artifacts.pain001Url);
console.log('Bundle:', artifacts.bundleUrl);
console.log('Manifest:', artifacts.manifestUrl);
```

## ✅ Verification

### Verify Receipt

```javascript
const verification = await proofrails.verify.byReceiptId('receipt-id');

if (verification.valid && verification.onChain) {
  console.log('✅ Receipt is valid and on-chain!');
  console.log('Anchor TX:', verification.anchorTx);
}
```

### Verify by Bundle Hash

```javascript
const verification = await proofrails.verify.byHash('0x123...');
```

### Get Verification Proof

```javascript
const proof = await proofrails.verify.getProof('receipt-id');

console.log('Bundle Hash:', proof.bundleHash);
console.log('Block Number:', proof.blockNumber);
console.log('Timestamp:', proof.timestamp);
```

## 🔴 Live Updates

```javascript
// Listen to receipt status changes in real-time
const listener = proofrails.events.listen('receipt-id', (update) => {
  console.log('Status:', update.status);
  
  if (update.status === 'anchored') {
    console.log('Receipt is now on-chain!');
    console.log('Anchor TX:', update.anchorTx);
    listener.stop(); // Stop listening
  }
});
```

## 🎨 Embeddable Widgets

### Generate Widget

```javascript
const widget = proofrails.embed.widget('receipt-id', {
  theme: 'light',
  width: '100%',
  height: '400px'
});

// Use in HTML
document.getElementById('receipt').innerHTML = widget.iframeHtml;
```

### Full Page URL

```javascript
const pageUrl = proofrails.embed.fullPage('receipt-id');
// https://middleware.com/receipt/receipt-id
```

## 📊 Statements

### Generate Intraday Statement

```javascript
const statement = await proofrails.statements.intraday({
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
  accountId: 'my-account'
});

console.log('Download:', statement.downloadUrl);
```

### Generate End-of-Day Statement

```javascript
const statement = await proofrails.statements.endOfDay({
  dateTo: '2024-01-31',
  accountId: 'my-account'
});
```

## 🔑 Project Management

### Get Project Info

```javascript
const info = await proofrails.project.getInfo();
console.log('Project ID:', info.projectId);
```

### Rotate API Key

```javascript
const newKey = await proofrails.project.rotateKey();
console.log('New API Key:', newKey.apiKey); // Save this!

// Update client with new key
proofrails.setApiKey(newKey.apiKey);
```

## 👨‍💼 Admin Operations

```javascript
const admin = new ProofRails({ adminToken: 'your-admin-token' });

// Create API key for specific project
const key = await admin.admin.createKey({
  projectId: 'proj-123',
  label: 'Production Key'
});

  label: 'Production Key'
});

// Delete API key
await admin.admin.deleteKey('key-id');
```

## 🌐 Networks

```javascript
// Testnet (default)
const proofrails = new ProofRails({
  apiKey: 'your-key',
  network: 'coston2'
});

// Mainnet
const proofrails = new ProofRails({
  apiKey: 'your-key',
  network: 'flare'
});
```

## 🛠️ Advanced Configuration

```javascript
const proofrails = new ProofRails({
  apiKey: 'your-key',
  network: 'coston2',
  baseUrl: 'https://custom-middleware.com', // Optional
  timeout: 60000 // Request timeout in ms (default: 30000)
});
```

## ⚛️ React Hooks (New!)

The SDK exports dedicated React hooks for the easiest integration experience.

### Setup

```typescript
import { useProofRails } from '@proofrails/sdk/react';

// Initialize the hook
const sdk = useProofRails({ 
  apiKey: 'your-api-key' 
});
```

### Sending Payments (Zero Boilerplate)

```typescript
import { useProofRailsPayment } from '@proofrails/sdk/react';

const { send, loading, receipt, status } = useProofRailsPayment(sdk);

const handleMyButton = async () => {
    await send({
        amount: "10.0",
        to: "0xReceiverAddress...",
        purpose: "Payment for Services"
    });
};
```

### Self-Serve Project Creation

```typescript
import { useCreateProject } from '@proofrails/sdk/react';

const { create, loading } = useCreateProject();

const setup = async () => {
    const { apiKey, projectId } = await create("My New dApp");
    console.log("My new key:", apiKey);
};
```

## 📖 TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import ProofRails, { Receipt, VerificationResult } from '@proofrails/sdk';

const proofrails = new ProofRails({ apiKey: 'your-key' });

const receipt: Receipt = await proofrails.templates.payment({
  amount: 100,
  from: 'Alice',
  to: 'Bob',
  purpose: 'Payment',
  transactionHash: '0x123...'
});

const verification: VerificationResult = await proofrails.verify.byReceiptId(receipt.id);
```

## 🔗 JavaScript (No TypeScript)

Works perfectly in plain JavaScript too:

```javascript
const ProofRails = require('@proofrails/sdk');

const proofrails = new ProofRails({ apiKey: 'your-key' });

// Same API, no types needed!
```

## 🐛 Error Handling

```javascript
import { ProofRailsError } from '@proofrails/sdk';

try {
  const receipt = await proofrails.receipts.get('invalid-id');
} catch (error) {
  if (error instanceof ProofRailsError) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.statusCode);
  }
}
```

## 📄 License

MIT

## 🤝 Support

- Documentation: [docs.proofrails.com](https://docs.proofrails.com)
- Issues: [GitHub Issues](https://github.com/proofrails/proofrails-sdk/issues)
- Email: support@proofrails.com

---

**Made with ❤️ by ProofRails**
#   P r o o f r a i l s - s d k  
 