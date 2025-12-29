
````md
# ProofRails SDK

**Beginner friendly SDK for creating blockchain verifiable ISO 20022 payment receipts**

Create compliant, auditable payment receipts with just a few lines of code. No blockchain expertise required.

## Features

- **Zero coding knowledge required**, use simple templates  
- **ISO 20022 compliant**, generates standard banking messages  
- **Blockchain verified**, receipts anchored on Flare blockchain  
- **Tamper proof**, cryptographic evidence bundles  
- **Real time updates**, live receipt status via SSE  
- **Works everywhere**, TypeScript, JavaScript, Node.js, browsers  

## 🚀 Zero Configuration Required

The SDK automatically connects to our production middleware. **No backend setup needed!**

- ✅ Just install and use
- ✅ Automatic API endpoint configuration
- ✅ Built-in retry logic and error handling
- ✅ Production-ready out of the box


## Installation

```bash
npm install @proofrails/sdk
# or
yarn add @proofrails/sdk
# or
pnpm add @proofrails/sdk
```

## Getting Your API Key

Before using the SDK, you need an API key:

### Option 1: Automatic (Recommended for Beginners)
```javascript
import ProofRails from '@proofrails/sdk';

// Creates a new project and returns your API key
const { client, apiKey, projectId } = await ProofRails.createProject({
  label: 'My App'
});

console.log('Save this API key:', apiKey);
// Use the client that's already configured
```

### Option 2: Manual
1. Visit [https://www.flarestudio.xyz/sdk/proofrails-sdk/create-api-key](https://www.flarestudio.xyz/sdk/proofrails-sdk/create-api-key)
2. Create a new project
3. Copy your API key
4. Use it in your code (see below)

## Quick Start

### Option 1, Create New Project (Easiest)

```javascript
import ProofRails from '@proofrails/sdk';

// Create a new project automatically
const { client, apiKey, projectId } = await ProofRails.createProject({
  label: 'My App'
});

console.log('Your API Key:', apiKey); // Save this
console.log('Your Project ID:', projectId);
```

### Option 2, Use Existing API Key

```javascript
import ProofRails from '@proofrails/sdk';

const proofrails = new ProofRails({
  apiKey: 'your-api-key-here'
});
```

## Templates (Beginner Friendly)

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

## Core Operations

### Get Receipt

```javascript
const receipt = await proofrails.receipts.get('receipt-id');

console.log(receipt.status);
console.log(receipt.amount);
console.log(receipt.anchorTx);
```

### List Receipts

```javascript
const { items, total } = await proofrails.receipts.list({
  limit: 10,
  status: 'anchored'
});

items.forEach(r => {
  console.log(r.id, r.amount);
});
```

### Download Artifacts

```javascript
const artifacts = await proofrails.receipts.getArtifacts('receipt-id');

console.log('ISO XML:', artifacts.pain001Url);
console.log('Bundle:', artifacts.bundleUrl);
console.log('Manifest:', artifacts.manifestUrl);
```

## Verification

### Verify Receipt

```javascript
const verification = await proofrails.verify.byReceiptId('receipt-id');

if (verification.valid && verification.onChain) {
  console.log('Receipt is valid and on chain');
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

## Live Updates

```javascript
const listener = proofrails.events.listen('receipt-id', update => {
  console.log('Status:', update.status);

  if (update.status === 'anchored') {
    console.log('Receipt is now on chain');
    listener.stop();
  }
});
```

## React Integration (Hooks)

The SDK includes built-in React hooks for easy integration:

### 1. Wrap your app with `ProofRailsProvider`

```javascript
// app/providers.tsx
'use client';

import { ProofRailsProvider } from '@proofrails/sdk/react';

export function Providers({ children }) {
  // Option 1: Env var (recommended)
  // PROOFRAILS_API_KEY must be set in .env.local
  // NEXT_PUBLIC_PROOFRAILS_BASE_URL (optional)
  return (
    <ProofRailsProvider apiKey={process.env.NEXT_PUBLIC_PROOFRAILS_API_KEY}>
      {children}
    </ProofRailsProvider>
  );
}
```

### 2. Use Hooks in Components

```javascript
// app/payment/page.tsx
'use client';

import { useProofRailsPayment } from '@proofrails/sdk/react';

export default function PaymentPage() {
  const { createPayment, isLoading, error, receipt } = useProofRailsPayment();

  const handlePay = async () => {
    try {
      await createPayment({
        amount: 100,
        from: '0x123...',
        to: '0x456...',
        purpose: 'Coffee',
        transactionHash: '0xabc...'
      });
      alert('Receipt Created!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handlePay} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Create Receipt'}
    </button>
  );
}
```

## Embeddable Widgets

### Generate Widget

```javascript
const widget = proofrails.embed.widget('receipt-id', {
  theme: 'light',
  width: '100%',
  height: '400px'
});

document.getElementById('receipt').innerHTML = widget.iframeHtml;
```

### Full Page URL

```javascript
const pageUrl = proofrails.embed.fullPage('receipt-id');
```

## Networks

```javascript
const proofrails = new ProofRails({
  apiKey: 'your-key',
  network: 'coston2'
});
```

```javascript
const proofrails = new ProofRails({
  apiKey: 'your-key',
  network: 'flare'
});
```

## License

MIT

## Support

* Documentation, [https://www.flarestudio.xyz/sdk/proofrails-sdk/overview](https://www.flarestudio.xyz/sdk/proofrails-sdk/overview)
* Repository, [https://github.com/Elite-tch/Proofrails-sdk.git](https://github.com/Elite-tch/Proofrails-sdk.git)
* Email, [izuchukwujohnbosco95@gmail.com](mailto:izuchukwujohnbosco95@gmail.com)

**Made with ❤️ by ProofRails**

```