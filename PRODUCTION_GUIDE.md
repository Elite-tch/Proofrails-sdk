# ProofRails SDK - Production Integration Guide

This guide covers recommended practices for running `@proofrails/sdk` in production environments.

---

## 1. Environment Configuration

In production, never hardcode API keys or base URLs into your application code. Use environment variables:

```bash
# Server-side environment variables
PROOFRAILS_API_KEY=your_production_api_key
PROOFRAILS_BASE_URL=https://middleware.yourcompany.com
PROOFRAILS_NETWORK=flare
```

### Next.js / Frontend Frameworks

For client-side React components, set:

```bash
NEXT_PUBLIC_PROOFRAILS_BASE_URL=https://middleware.yourcompany.com
```

> **Security Note:** Never expose `PROOFRAILS_ADMIN_TOKEN` or private keys in client-side code or public bundles.

---

## 2. Safe Writes with Idempotency Keys

Mutations (`receipts.create`) can be safely retried without fear of duplicating records by supplying an `idempotencyKey`:

```typescript
import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({
  apiKey: process.env.PROOFRAILS_API_KEY,
  baseUrl: process.env.PROOFRAILS_BASE_URL,
  network: 'flare',
  retries: 3,
});

// Use a unique UUID or hash of the on-chain transaction
const receipt = await proofrails.receipts.create({
  transactionHash: '0xabc123...',
  chain: 'flare',
  amount: 250,
  currency: 'FLR',
  sender: '0xSenderAddress...',
  receiver: '0xReceiverAddress...',
  reference: 'Invoice #1042',
  idempotencyKey: 'tx-0xabc123-record-v1', // Enforces safe retry
});
```

The SDK automatically refuses to retry non-idempotent mutations, ensuring network timeouts never cause double-submissions.

---

## 3. Cryptographic On-Chain Verification

To verify that an evidence bundle was cryptographically registered and anchored on Flare:

```typescript
const verification = await proofrails.verify.byReceiptId(receipt.id);

if (verification.valid && verification.onChain) {
  console.log('Verified on Flare:', verification.anchorTx);
  console.log('Bundle hash:', verification.bundleHash);
  console.log('Checks:', verification.checks);
} else {
  console.error('Verification failed:', verification.errors);
}
```

The SDK checks:
1. Receipt existence and anchored status.
2. Direct Flare JSON-RPC read of the anchor transaction on chain 14, confirming status 1 and verifying the EvidenceAnchored event log contains the exact bundle hash.
3. Transaction hash matching.

---

## 4. Private Key Custody & Signing

The ProofRails SDK never transmits private keys over the wire.

For autonomous agent anchoring or payment signing:
- Use external signers (e.g. Turnkey, Privy, AWS KMS, or hardware wallets).
- Have your backend or agent worker sign transactions locally.
- Pass only public transaction hashes or signed payload receipts to ProofRails.

---

## 5. Rate Limits & Connection Monitoring

Inspect remaining API budget from client response headers:

```typescript
const rateLimit = proofrails.getClient().getRateLimitInfo();
if (rateLimit) {
  console.log(`Remaining requests: ${rateLimit.remaining} / ${rateLimit.limit}`);
  console.log(`Reset at: ${rateLimit.resetDate.toISOString()}`);
}
```
