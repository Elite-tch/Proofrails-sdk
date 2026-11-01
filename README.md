# ProofRails SDK

**TypeScript & JavaScript SDK for creating blockchain-verifiable ISO 20022 payment records, cryptographic evidence bundles, and Flare on-chain anchors.**

ProofRails converts on-chain payment transactions and agentic payments into ISO 20022-style XML messages (pain.001, pacs.008, camt.052, camt.053, and more), packages them into evidence ZIP bundles, and anchors their cryptographic hashes on Flare for integrity verification.

---

## Key Capabilities

* **ISO 20022 XML Generation**: Generates standard ISO 20022-style XML message types directly from on-chain transaction hashes.
* **On-Chain Verification**: Evidence bundle hashes are cryptographically anchored to the Flare EvidenceAnchor smart contract for timestamping and integrity verification.
* **Beginner-Friendly Templates**: Create payment, donation, escrow, grant, and refund receipts in 3 lines of code.
* **Autonomous AI Agents**: Register AI agents, parse natural language commands, and anchor operational data on-chain without transmitting private keys.
* **x402 v2 Pay-Per-Request**: Official challenge-response paywall using EIP-3009 `TransferWithAuthorization` on Flare. `fetchWithPayment()` handles the full 402→sign→retry cycle automatically.
* **Financial Statements**: Export intraday (`camt.052`) and end-of-day (`camt.053`) account balance reports.
* **Flare FTSO & FDC**: Endpoints for FTSO price queries and Flare Data Connector (FDC) attestation preparation.
* **Real-Time Push Events**: Subscribe to Server-Sent Events (SSE) to track receipt anchoring in real time.
* **React Hooks**: Built-in `useReceipt`, `useReceipts`, `useVerifyReceipt`, and `useX402Payment` for modern web apps.

---

## Installation

```bash
npm install @proofrails/sdk
# or
pnpm add @proofrails/sdk
# or
yarn add @proofrails/sdk
```

---

## Getting Started

### Backend Prerequisite
> **Note**: This SDK is the client library. It connects to a ProofRails Middleware backend instance that you run or deploy yourself. We do not provide or host a shared public backend.
>
> To set up your middleware backend, follow the instructions in the official repository:  
> [https://github.com/proofrails/middleware-ISO-v2.2-and-x402](https://github.com/proofrails/middleware-ISO-v2.2-and-x402)

### Initialize the Client

Point the SDK to your self-hosted or local middleware instance:

```typescript
import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({
  // Point to your deployed or local ProofRails middleware instance
  baseUrl: process.env.PROOFRAILS_BASE_URL || 'http://127.0.0.1:8000',
  apiKey: process.env.PROOFRAILS_API_KEY || 'proofrails-local-dev-key',
  network: 'coston2', // 'coston2' (testnet) or 'flare' (mainnet)
});
```

---

## Beginner Templates

Templates provide high-level abstractions that handle formatting and smart defaults automatically.

### Payment Receipt
```typescript
const receipt = await proofrails.templates.payment({
  amount: 150.00,
  from: 'Alice',
  to: 'Bob',
  purpose: 'Freelance Design Milestone',
  transactionHash: '0x3a4b5c6d...',
  senderWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  receiverWallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  currency: 'C2FLR',
});

console.log('Receipt ID:', receipt.id);
console.log('Status:', receipt.status); // 'pending'
```

### Donation Receipt
```typescript
const donation = await proofrails.templates.donation({
  amount: 50.00,
  donor: 'Anonymous',
  recipient: 'Open Source Security Initiative',
  cause: 'Annual Maintenance Fund',
  transactionHash: '0x811b72...',
});
```

### Escrow Release Receipt
```typescript
const escrow = await proofrails.templates.escrow({
  amount: 1000.00,
  buyer: 'Acme Corp',
  seller: 'Contractor LLC',
  escrowId: 'ESC-2026-001',
  releaseReason: 'Milestone 2 QA Approved',
  transactionHash: '0x7890ab...',
});
```

---

## Core Operations

### Create Detailed Receipt
```typescript
const receipt = await proofrails.receipts.create({
  transactionHash: '0x94821a4f00b9472e90c741e12d48ef01c590ad2768564177bc901e18b84310a2',
  chain: 'coston2',
  amount: 2500.50,
  currency: 'USDC',
  sender: '0x1111111111111111111111111111111111111111',
  receiver: '0x2222222222222222222222222222222222222222',
  reference: 'INV-OCT-2026-88',
  tags: ['enterprise', 'q4-payroll'],
  idempotencyKey: 'payroll-batch-001-tx-12',
});
```

### List Receipts
```typescript
const { items, total } = await proofrails.receipts.list({
  limit: 10,
  tags: ['enterprise'],
  status: 'anchored',
});

console.log(`Found ${total} receipts`);
```

### Get Receipt Details & Status
```typescript
// Full receipt details
const details = await proofrails.receipts.get(receiptId);
console.log(details.amount, details.currency, details.sender, details.receiver);

// Lightweight status check (ideal for polling loops)
const statusInfo = await proofrails.receipts.getStatus(receiptId);
console.log(statusInfo.status, statusInfo.bundleHash);
```

### Download ISO 20022 Artifacts
```typescript
const artifacts = await proofrails.receipts.getArtifacts(receiptId);

console.log('pain.001 XML:', artifacts.pain001Url);
console.log('camt.054 XML:', artifacts.camt054Url);
console.log('Evidence ZIP Bundle:', artifacts.bundleUrl);
console.log('Manifest JSON:', artifacts.manifestUrl);
```

---

## Cryptographic Verification

### Verify On-Chain
```typescript
// Verify by Receipt ID
const result = await proofrails.verify.byReceiptId(receiptId);

if (result.valid) {
  console.log('Verified on Flare!');
  console.log('Anchor Transaction:', result.anchorTx);
  console.log('Bundle Hash:', result.bundleHash);
}

// Verify by Bundle Hash directly
const hashResult = await proofrails.verify.byHash('0xbbddce647bfe...');
```

### IPFS / Arweave Verification
```typescript
const decentralizedResult = await proofrails.verify.byCid({
  cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  store: 'ipfs',
});
```

---

## Autonomous AI Agents

```typescript
// 1. Register an autonomous agent
const agent = await proofrails.agents.create({
  name: 'Invoice Reconciliation Bot',
  walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  pricingRules: { reconcile: '0.05' },
});

// 2. Anchor arbitrary agent operations on-chain
const anchor = await proofrails.agents.anchorData(
  agent.id,
  {
    action: 'BATCH_RECONCILE',
    itemsProcessed: 42,
    timestamp: Date.now(),
  },
  {
    description: 'Daily Ledger Reconciliation Log',
    submitOnchain: true,
  }
);

console.log('Anchored Tx:', anchor.flare_txid);
```

---


---

## x402 v2 Pay-Per-Request Protocol (EIP-3009 / Automated)

The SDK implements the **official x402 v2 challenge-response protocol** using EIP-3009
`TransferWithAuthorization` on Flare mainnet (Chain 14) with USD&#x20ae;0.

The helper `fetchWithPayment()` handles the full flow automatically:
1. Sends the request; intercepts the `402 Payment Required` response.
2. Decodes the `PAYMENT-REQUIRED` challenge header.
3. Signs a `TransferWithAuthorization` EIP-712 message with the provided key or wallet signer.
4. Retries with the `PAYMENT-SIGNATURE` header containing the base64-encoded authorization.

```typescript
import { fetchWithPayment } from '@proofrails/sdk';

// Automated end-to-end: sign and pay in one call
const response = await fetchWithPayment(
  'https://your-proofrails-instance.example.com/v1/premium/fx_lookup?base=USD&quote=FLR',
  {},  // optional fetch RequestInit
  process.env.PAYER_PRIVATE_KEY,  // 0x-prefixed 32-byte hex key
);

const data = await response.json();
console.log('Rate:', data.rate, '| Source:', data.source);
// Rate: 0.00610352 | Source: ftso
```

Or step-by-step with any EIP-712 signer (viem, ethers, wagmi):

```typescript
import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: '...', apiKey: '...' });

// 1. Check pricing
const prices = await proofrails.x402.pricing();

// 2. Call premium endpoint — the SDK handles 402 automatically
const fx = await proofrails.x402.premiumFxLookup(
  process.env.PAYER_PRIVATE_KEY,      // or a viem/ethers signer object
  { baseCcy: 'USD', quoteCcy: 'FLR' }
);

console.log('Rate:', fx.rate, '| Source:', fx.source);
```

> **Network safety**: If the server challenge does not include a Flare (eip155:14) +
> USD&#x20ae;0 payment option, `fetchWithPayment()` throws `UNSUPPORTED_PAYMENT_NETWORK`
> instead of silently signing for the wrong chain.

### Legacy: Transaction-Hash Proof Header

If your backend uses the **older** custom `X-PAYMENT` header flow (pre-x402 v2), use
the explicit helper instead:

```typescript
import { createTransactionPaymentHeader } from '@proofrails/sdk';

const xPayment = createTransactionPaymentHeader({
  txHash: '0xabc123...',
  amount: '0.01',
  recipient: '0x1234567890123456789012345678901234567890',
  currency: 'USDC',
  chain: 'base',
});

// Pass manually to the statements or any other endpoint
const statement = await proofrails.statements.endOfDay({
  dateFrom: '2026-10-14',
  xPayment,
});
```

---

## Financial Statements (ISO 20022)

```typescript
// Export official end-of-day statement (camt.053)
const statement = await proofrails.statements.endOfDay({
  dateFrom: '2026-10-14',
  // xPayment: xPayment,  // only needed for legacy X-PAYMENT backends
});

console.log('ISO camt.053 XML:', statement.xml);
console.log('Transactions Count:', statement.count);
```

---

## Real-Time SSE Events

```typescript
const subscription = proofrails.events.listen(receiptId, (update) => {
  console.log('Live Status Update:', update.status);

  if (update.status === 'anchored') {
    console.log('Confirmed on Flare:', update.anchorTx);
    subscription.stop();
  }
});
```

---

## React Integration

Wrap your app in `ProofRailsProvider` to use declarative hooks in your frontend components:

```tsx
import React from 'react';
import { ProofRailsProvider, useReceipt, useVerifyReceipt } from '@proofrails/sdk/react';

export function App() {
  return (
    <ProofRailsProvider
      config={{
        baseUrl: 'http://127.0.0.1:8000',
        apiKey: 'proofrails-local-dev-key',
      }}
    >
      <ReceiptView receiptId="ce620107-5389-432e-b2ad-ab80886402fb" />
    </ProofRailsProvider>
  );
}

function ReceiptView({ receiptId }: { receiptId: string }) {
  const { receipt, isLoading } = useReceipt(receiptId);
  const { verify, isVerifying, result } = useVerifyReceipt();

  if (isLoading) return <div>Loading...</div>;
  if (!receipt) return null;

  return (
    <div>
      <h3>{receipt.reference}</h3>
      <p>{receipt.amount} {receipt.currency}</p>
      <button onClick={() => verify(receiptId)} disabled={isVerifying}>
        {isVerifying ? 'Verifying...' : 'Verify on Flare'}
      </button>
      {result && <p>Valid: {result.valid ? 'Yes' : 'No'}</p>}
    </div>
  );
}
```

---

## Repository & Contributing

* **Repository**: [https://github.com/Elite-tch/Proofrails-sdk](https://github.com/Elite-tch/Proofrails-sdk)
* **Contributing Guide**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for local development workflows, code standards, and PR guidelines.
* **Issues & Bug Reports**: [https://github.com/Elite-tch/Proofrails-sdk/issues](https://github.com/Elite-tch/Proofrails-sdk/issues)
* **Documentation Portal**: Check out [docs/](./docs) or run `npm run dev` in `docs/` to view the full interactive developer portal.

---

## License

MIT License. Built for the Flare and ISO 20022 developer ecosystem.
