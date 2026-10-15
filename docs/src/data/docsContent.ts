export interface ParameterItem {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface StepItem {
  number: number;
  title: string;
  description: string;
}

export interface DocPage {
  id: string;
  category: string;
  title: string;
  lead: string;
  overview: string;
  steps?: StepItem[];
  parameters?: ParameterItem[];
  codeExample: {
    language: string;
    filename: string;
    code: string;
  };
  responseExample?: {
    filename: string;
    code: string;
  };
  bestPractices: string;
}

export const DOCS_CATEGORIES = [
  {
    name: 'Getting Started',
    items: [
      { id: 'quickstart', title: 'Quickstart & Installation' },
      { id: 'templates', title: 'Beginner Templates' },
      { id: 'client-config', title: 'Client & Configuration' },
      { id: 'network-support', title: 'Network & Flare Support' },
    ],
  },
  {
    name: 'Core Payment Receipts',
    items: [
      { id: 'receipts', title: 'Creating & Managing Receipts' },
      { id: 'receipt-artifacts', title: 'ISO 20022 XML Artifacts' },
      { id: 'anchoring', title: 'Tenant-Mode Anchoring' },
    ],
  },
  {
    name: 'Cryptographic Verification',
    items: [
      { id: 'verification', title: 'On-Chain Verification' },
      { id: 'storage-verification', title: 'IPFS & Arweave Verification' },
    ],
  },
  {
    name: 'Autonomous AI Agents',
    items: [
      { id: 'agents', title: 'Agent Registration & Anchoring' },
      { id: 'agent-ai', title: 'AI Command Parsing' },
    ],
  },
  {
    name: 'x402 Micropayments',
    items: [
      { id: 'x402', title: 'Pay-Per-Request Protocol' },
      { id: 'x402-premium', title: 'Premium x402 Endpoints' },
    ],
  },
  {
    name: 'Financial Reporting',
    items: [
      { id: 'statements', title: 'camt.052 & camt.053 Generation' },
    ],
  },
  {
    name: 'Flare Protocol & AI Skills',
    items: [
      { id: 'flare', title: 'FTSO v2 Rates & FDC Proofs' },
    ],
  },
  {
    name: 'Real-Time & Monitoring',
    items: [
      { id: 'events', title: 'Server-Sent Events & Embeds' },
      { id: 'webhooks-monitoring', title: 'Webhooks & Wallet Watchlist' },
    ],
  },
  {
    name: 'Project & Admin',
    items: [
      { id: 'project-admin', title: 'Projects & API Key Admin' },
    ],
  },
  {
    name: 'Utilities & Validation',
    items: [
      { id: 'validation', title: 'Input Validation Helpers' },
      { id: 'chain-utils', title: 'Chain & Amount Utilities' },
      { id: 'error-handling', title: 'Error Codes & Resilience' },
    ],
  },
  {
    name: 'Frontend dApps',
    items: [
      { id: 'react', title: 'React Provider & Complete Hooks' },
    ],
  },
];

export const DOCS_PAGES: Record<string, DocPage> = {
  quickstart: {
    id: 'quickstart',
    category: 'Getting Started',
    title: 'Quickstart & Installation',
    lead: 'Get up and running with the ProofRails SDK in less than five minutes. Connect your app to Flare mainnet, the Coston2 testnet, or your self-hosted middleware backend.',
    overview: 'The ProofRails SDK is a client library. It connects to an instance of the ProofRails Middleware that you deploy or run yourself (repository: github.com/proofrails/middleware-ISO-v2.2-and-x402). The SDK turns blockchain transaction hashes into structured ISO 20022 messages, builds deterministic evidence ZIP bundles, and anchors cryptographic hashes to the Flare blockchain.',
    steps: [
      {
        number: 1,
        title: 'Run or deploy your middleware backend',
        description: 'Deploy the open-source ProofRails middleware (see github.com/proofrails/middleware-ISO-v2.2-and-x402) or run it locally at http://127.0.0.1:8000.',
      },
      {
        number: 2,
        title: 'Install the SDK package',
        description: 'Run npm install @proofrails/sdk viem (or pnpm add / yarn add / bun add) in your terminal.',
      },
      {
        number: 3,
        title: 'Initialize the ProofRails client',
        description: 'Configure your baseUrl pointing to your deployed middleware instance along with your API key.',
      },
    ],
    parameters: [
      { name: 'apiKey', type: 'string', required: false, description: 'Your ProofRails project API key. Set to proofrails-local-dev-key when testing locally.' },
      { name: 'baseUrl', type: 'string', required: true, description: 'URL of your self-hosted or local ProofRails middleware instance (e.g. http://127.0.0.1:8000).' },
      { name: 'network', type: 'flare | coston2', required: false, description: 'The blockchain network to anchor proofs on. Defaults to coston2 for testnet testing.' },
      { name: 'timeout', type: 'number', required: false, description: 'HTTP request timeout in milliseconds. Defaults to 30000 (30 seconds).' },
      { name: 'retries', type: 'number', required: false, description: 'Number of automatic retry attempts upon network drops. Defaults to 3.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'index.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

// 1. Initialize client pointing to your self-hosted middleware
const proofrails = new ProofRails({
  apiKey: process.env.PROOFRAILS_API_KEY || 'proofrails-local-dev-key',
  baseUrl: process.env.PROOFRAILS_BASE_URL || 'http://127.0.0.1:8000',
  network: 'coston2', // 'coston2' (testnet) or 'flare' (mainnet)
});

// 2. Simple health check
async function checkConnection() {
  const receipts = await proofrails.receipts.list({ limit: 1 });
  console.log('Connected! Existing receipts count in database:', receipts.total);
}

checkConnection().catch(console.error);`,
    },
    responseExample: {
      filename: 'console output',
      code: `Connected! Existing receipts count in database: 0`,
    },
    bestPractices: 'Always keep your API keys in environment variables. Pointing to http://127.0.0.1:8000 allows you to test receipts locally without spending real gas.',
  },

  templates: {
    id: 'templates',
    category: 'Getting Started',
    title: 'Beginner-Friendly Templates',
    lead: 'Create banking-compliant payment receipts with zero boilerplate. Five smart templates pre-configured for real-world payment flows.',
    overview: 'Instead of manually structuring ISO 20022 wire payloads, you can use built-in convenience templates. Whether you are building an e-commerce checkout, a grant disbursement tool, or an escrow release, templates supply smart defaults like network detection and reference string formatting.',
    parameters: [
      { name: 'amount', type: 'number', required: true, description: 'The decimal payment amount sent in the transaction.' },
      { name: 'from', type: 'string', required: true, description: 'Human-readable sender name or organization identity.' },
      { name: 'to', type: 'string', required: true, description: 'Human-readable recipient name or organization identity.' },
      { name: 'purpose', type: 'string', required: true, description: 'The business purpose of the payment (e.g. Invoice INV-204).' },
      { name: 'transactionHash', type: 'string', required: true, description: '0x-prefixed transaction hash from the blockchain.' },
      { name: 'senderWallet', type: 'string', required: false, description: '0x-prefixed sender wallet address.' },
      { name: 'receiverWallet', type: 'string', required: false, description: '0x-prefixed receiver wallet address.' },
      { name: 'chain', type: 'coston2 | flare', required: false, description: 'Chain where payment took place. Defaults to coston2.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'create-templates.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({
  apiKey: process.env.PROOFRAILS_API_KEY,
  baseUrl: 'http://127.0.0.1:8000',
});

async function runTemplates() {
  // 1. Standard Payment Template
  const paymentReceipt = await proofrails.templates.payment({
    amount: 150.00,
    from: 'Acme Corp',
    to: 'Freelance Studio Ltd',
    purpose: 'Frontend Design Milestone 1',
    transactionHash: '0x94821a4f00b9472e90c741e12d48ef01c590ad2768564177bc901e18b84310a2',
    senderWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    receiverWallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    currency: 'C2FLR',
  });

  console.log('Payment Receipt Created:', paymentReceipt.id);
  console.log('Initial Status:', paymentReceipt.status);

  // 2. Donation Template
  const donationReceipt = await proofrails.templates.donation({
    amount: 50.00,
    donor: 'Anonymous Benefactor',
    recipient: 'Open Source Security Fund',
    cause: 'Q4 2026 Maintenance Grant',
    transactionHash: '0x811b72e90c741e12d48ef01c590ad2768564177bc901e18b84310a294821a4f0',
  });

  console.log('Donation Receipt Created:', donationReceipt.id);
}

runTemplates().catch(console.error);`,
    },
    responseExample: {
      filename: 'response.json',
      code: `{
  "id": "7d3e8a09-81d2-421b-ae0c-bdbc29a04ee1",
  "status": "pending",
  "transactionHash": "0x94821a4f00b9472e90c741e12d48ef01c590ad2768564177bc901e18b84310a2",
  "chain": "coston2",
  "amount": "150",
  "currency": "C2FLR",
  "reference": "Payment: Frontend Design Milestone 1 (Tx: 0x9482...)",
  "createdAt": "2026-10-15T06:30:00.000Z"
}`,
    },
    bestPractices: 'Templates return immediately with status set to pending. The middleware will process the ISO XML and build the evidence bundle in the background.',
  },

  'client-config': {
    id: 'client-config',
    category: 'Getting Started',
    title: 'Client & Configuration',
    lead: 'Deep dive into timeout settings, exponential backoff retries, header injection, and rate limiting.',
    overview: 'The APIClient powers all HTTP communication in the SDK. It includes built-in retry logic with progressive backoff delays (1s, 2s, 4s), rate limit header parsing, and connection pooling.',
    parameters: [
      { name: 'baseUrl', type: 'string', required: true, description: 'URL of your deployed middleware.' },
      { name: 'apiKey', type: 'string', required: false, description: 'Project API key for write operations.' },
      { name: 'adminToken', type: 'string', required: false, description: 'Bearer admin token for project configuration endpoints.' },
      { name: 'timeout', type: 'number', required: false, description: 'Request abort timeout in ms. Default 30000.' },
      { name: 'retries', type: 'number', required: false, description: 'Max retry attempts. Default 3.' },
      { name: 'retryDelay', type: 'number', required: false, description: 'Initial retry backoff in ms. Default 1000.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'custom-client.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({
  baseUrl: 'http://127.0.0.1:8000',
  apiKey: 'proofrails-local-dev-key',
  timeout: 45000,   // 45 seconds timeout
  retries: 5,       // Retry 5 times on network drop
  retryDelay: 1500, // Start backoff at 1.5 seconds
});

// Inspect rate limits returned by recent requests
const limits = proofrails.client.getRateLimitInfo();
if (limits) {
  console.log('Remaining Requests:', limits.remaining);
  console.log('Reset Time:', limits.resetDate);
}`,
    },
    responseExample: {
      filename: 'rate-limit.json',
      code: `{
  "limit": 100,
  "remaining": 98,
  "reset": 1729003600,
  "resetDate": "2026-10-15T08:00:00.000Z"
}`,
    },
    bestPractices: 'If you are running in serverless environments like AWS Lambda or Vercel functions, keep timeout around 15000ms so execution contexts do not hang indefinitely.',
  },

  'network-support': {
    id: 'network-support',
    category: 'Getting Started',
    title: 'Network & Flare Support',
    lead: 'Supported blockchain networks, chain IDs, contract addresses, and network auto-detection.',
    overview: 'ProofRails operates primarily on Flare mainnet and the Coston2 testnet. Anchors are recorded on the EvidenceAnchor smart contract on Flare C-Chain.',
    parameters: [
      { name: 'coston2', type: 'network', required: false, description: 'Flare Coston2 Testnet. Chain ID 114. Native asset C2FLR.' },
      { name: 'flare', type: 'network', required: false, description: 'Flare Mainnet. Chain ID 14. Native asset FLR.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'networks.ts',
      code: `import { detectNetworkFromChainId, getExplorerUrl, getContractAddress } from '@proofrails/sdk';

// 1. Detect network from user's connected wallet chain ID
const network = detectNetworkFromChainId(114);
console.log('Detected Network:', network); // 'coston2'

// 2. Get the deployed EvidenceAnchor contract address
const contract = getContractAddress('coston2');
console.log('Anchor Contract:', contract);

// 3. Generate block explorer URL for a transaction
const explorer = getExplorerUrl('coston2', '0x1234567890abcdef');
console.log('Block Explorer Link:', explorer);`,
    },
    responseExample: {
      filename: 'console output',
      code: `Detected Network: coston2
Anchor Contract: 0x0690d8cFb1897c12B2C0b34660edBDE4E20ff4d8
Block Explorer Link: https://coston2-explorer.flare.network/tx/0x1234567890abcdef`,
    },
    bestPractices: 'Always test on Coston2 before switching network to flare in production.',
  },

  receipts: {
    id: 'receipts',
    category: 'Core Payment Receipts',
    title: 'Creating & Managing Receipts',
    lead: 'Full programmatic control over receipt generation, pagination, tag filtering, and lifecycle status checks.',
    overview: 'The receipts module provides direct access to the middleware receipt engine. In addition to creating receipts, you can query historical receipts with cursor-based or page-based pagination, filter by custom agent tags, and poll status.',
    parameters: [
      { name: 'transactionHash', type: 'string', required: true, description: 'Blockchain transaction hash that finalized the payment.' },
      { name: 'amount', type: 'string | number', required: true, description: 'Exact payment amount.' },
      { name: 'currency', type: 'string', required: true, description: 'Asset symbol (e.g. FLR, C2FLR, USDC, EUR).' },
      { name: 'sender', type: 'string', required: true, description: 'Sender wallet address or corporate identity.' },
      { name: 'receiver', type: 'string', required: true, description: 'Receiver wallet address or corporate identity.' },
      { name: 'reference', type: 'string', required: true, description: 'Unique external reference or invoice number.' },
      { name: 'tags', type: 'string[]', required: false, description: 'Custom array of tags for grouping and filtering receipts.' },
      { name: 'idempotencyKey', type: 'string', required: false, description: 'UUID to prevent duplicate submissions on retry.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'receipts-demo.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function manageReceipts() {
  // 1. Create a detailed receipt with metadata and idempotency protection
  const newReceipt = await proofrails.receipts.create({
    transactionHash: '0x3a4b5c6d7e8f901234567890abcdef1234567890abcdef1234567890abcdef12',
    chain: 'coston2',
    amount: 2500.50,
    currency: 'USDC',
    sender: '0x1111111111111111111111111111111111111111',
    receiver: '0x2222222222222222222222222222222222222222',
    reference: 'INV-OCT-2026-88',
    tags: ['enterprise', 'q4-payroll'],
    idempotencyKey: 'payroll-batch-001-tx-12',
  });

  console.log('Created Receipt ID:', newReceipt.id);

  // 2. Fetch recent receipts filtered by tags
  const list = await proofrails.receipts.list({
    limit: 10,
    tags: ['enterprise'],
  });

  console.log(\`Found \${list.total} enterprise receipts:\`);
  list.items.forEach(r => {
    console.log(\` - \${r.reference}: \${r.amount} \${r.currency} [\${r.status}]\`);
  });

  // 3. Lightweight status check (ideal for polling loops)
  const statusInfo = await proofrails.receipts.getStatus(newReceipt.id);
  console.log('Current lifecycle status:', statusInfo.status);
}

manageReceipts().catch(console.error);`,
    },
    responseExample: {
      filename: 'receipt-details.json',
      code: `{
  "id": "ce620107-5389-432e-b2ad-ab80886402fb",
  "status": "anchored",
  "amount": "2500.500000000000000000",
  "currency": "USDC",
  "chain": "coston2",
  "sender": "0x1111111111111111111111111111111111111111",
  "receiver": "0x2222222222222222222222222222222222222222",
  "reference": "INV-OCT-2026-88",
  "bundleHash": "0x4f82a170b689...34",
  "anchorTx": "0x9812bc87...fa",
  "anchoredAt": "2026-10-15T06:32:10.000Z"
}`,
    },
    bestPractices: 'Always supply an idempotencyKey when submitting payments from automated pipelines. If network hiccups cause your script to retry, the middleware recognizes the key and returns the existing receipt without creating duplicates.',
  },

  'receipt-artifacts': {
    id: 'receipt-artifacts',
    category: 'Core Payment Receipts',
    title: 'ISO 20022 XML Artifacts & Bundles',
    lead: 'Download generated XML banking messages, cryptographic manifests, and evidence ZIP packages for auditors.',
    overview: 'Whenever a receipt is recorded, the ProofRails engine builds a complete audit package. This includes the pain.001 Credit Transfer Initiation XML, pain.002 Payment Status Report, and a deterministic ZIP archive containing all files and SHA-256 hashes.',
    codeExample: {
      language: 'typescript',
      filename: 'artifacts.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function inspectArtifacts(receiptId: string) {
  // Retrieve download URLs for all generated evidence files
  const artifacts = await proofrails.receipts.getArtifacts(receiptId);

  console.log('Audit Package Links:');
  console.log('pain.001 XML:', artifacts.pain001Url);
  console.log('camt.054 XML:', artifacts.camt054Url);
  console.log('Evidence ZIP Bundle:', artifacts.bundleUrl);
  console.log('Manifest JSON:', artifacts.manifestUrl);
}

inspectArtifacts('ce620107-5389-432e-b2ad-ab80886402fb').catch(console.error);`,
    },
    responseExample: {
      filename: 'artifacts-output.json',
      code: `{
  "pain001Url": "/files/ce620107-5389-432e-b2ad-ab80886402fb/pain001.xml",
  "bundleUrl": "http://127.0.0.1:8000/files/ce620107-5389-432e-b2ad-ab80886402fb/evidence.zip",
  "manifestUrl": "http://127.0.0.1:8000/files/ce620107-5389-432e-b2ad-ab80886402fb/manifest.json"
}`,
    },
    bestPractices: 'Store the bundleUrl or download the evidence ZIP for long-term cold storage. Even if your database is ever reset, anyone holding the ZIP can independently prove its authenticity on-chain.',
  },

  anchoring: {
    id: 'anchoring',
    category: 'Core Payment Receipts',
    title: 'Tenant-Mode Anchoring',
    lead: 'Query cross-chain anchors and confirm custom on-chain transactions submitted by your own tenant infrastructure.',
    overview: 'In enterprise tenant mode, organizations can submit their own on-chain anchoring transactions using their own funded private keys rather than the platform signer. The anchoring module allows confirming these transactions and listing all anchored chains.',
    parameters: [
      { name: 'receiptId', type: 'string', required: true, description: 'UUID of the receipt being anchored.' },
      { name: 'flareTxid', type: 'string', required: true, description: 'Transaction hash of the anchor tx executed by the tenant.' },
      { name: 'chain', type: 'string', required: false, description: 'Target chain (defaults to flare).' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'tenant-anchor.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function handleTenantAnchor(receiptId: string) {
  // 1. List existing anchor records across all configured chains
  const anchors = await proofrails.anchors.list(receiptId);
  console.log('Active anchors:', anchors);

  // 2. Confirm a transaction submitted by tenant's own wallet
  const confirmation = await proofrails.anchors.confirm({
    receiptId,
    flareTxid: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    chain: 'flare',
  });

  console.log('Confirmation Status:', confirmation.status);
  console.log('Confirmed Anchor Tx:', confirmation.flareTxid);
}

handleTenantAnchor('ce620107-5389-432e-b2ad-ab80886402fb').catch(console.error);`,
    },
    responseExample: {
      filename: 'confirmation.json',
      code: `{
  "receiptId": "ce620107-5389-432e-b2ad-ab80886402fb",
  "status": "anchored",
  "flareTxid": "0xabc123...def",
  "anchoredAt": "2026-10-15T08:05:00.000Z"
}`,
    },
    bestPractices: 'Tenant mode gives organizations full autonomy over their gas expenditure and contract owner addresses.',
  },

  verification: {
    id: 'verification',
    category: 'Cryptographic Verification',
    title: 'On-Chain Verification',
    lead: 'Trustless verification against the Flare EvidenceAnchor smart contract. Confirm proof integrity without trusting any intermediary.',
    overview: 'Verification calculates the SHA-256 hash of the evidence bundle and verifies whether that exact 32-byte digest was recorded in the EvidenceAnchor contract on Flare. If confirmed, it returns the on-chain transaction ID and block confirmation timestamp.',
    parameters: [
      { name: 'receiptId', type: 'string', required: true, description: 'UUID of the receipt stored in the middleware.' },
      { name: 'bundleHash', type: 'string', required: false, description: '0x-prefixed 32-byte hash of the evidence ZIP bundle.' },
      { name: 'bundleUrl', type: 'string', required: false, description: 'Public HTTP URL where the ZIP file can be downloaded and hashed.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'verify.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function verifyPayment(receiptId: string) {
  // Method 1: Verify directly by Receipt ID
  const result = await proofrails.verify.byReceiptId(receiptId);

  if (result.valid) {
    console.log('Payment is cryptographically verified on Flare!');
    console.log('Anchor Transaction:', result.anchorTx);
    console.log('Bundle Hash:', result.bundleHash);
    console.log('Confirmed At:', result.timestamp);
  }

  // Method 2: Extract complete legal proof report for external auditor
  const proof = await proofrails.verify.getProof(receiptId);
  console.log('Contract Address:', proof.contractAddress);
  console.log('Network:', proof.network);
}

verifyPayment('ce620107-5389-432e-b2ad-ab80886402fb').catch(console.error);`,
    },
    responseExample: {
      filename: 'verification-result.json',
      code: `{
  "valid": true,
  "onChain": true,
  "bundleHash": "0xbbddce647bfe8c5704f8f9c8ba49921f7c45d8859e85f7584e915ee4d6e1b859",
  "anchorTx": "0x391e48bc7201fae92817203bca01e294821a4f00b9472e90c741e12d48ef01c5",
  "timestamp": "2026-10-15T06:33:45.000Z"
}`,
    },
    bestPractices: 'For high-assurance compliance, store both the anchorTx hash and bundleHash alongside your internal accounting records.',
  },

  'storage-verification': {
    id: 'storage-verification',
    category: 'Cryptographic Verification',
    title: 'IPFS & Arweave Verification',
    lead: 'Verify decentralized evidence bundles stored across IPFS and Arweave permanent storage.',
    overview: 'ProofRails supports decentralized storage providers. When evidence bundles are stored on IPFS or Arweave, you can use byCid to download the content from the decentralized gateway, verify its SHA-256 integrity, and cross-reference with the on-chain anchor on Flare.',
    codeExample: {
      language: 'typescript',
      filename: 'verify-cid.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function verifyDecentralizedBundle() {
  const result = await proofrails.verify.byCid({
    cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    store: 'ipfs', // or 'arweave'
  });

  console.log('IPFS Bundle Verified:', result.valid);
  console.log('Bundle Hash:', result.bundleHash);
  console.log('Flare Anchor Tx:', result.anchorTx);
}

verifyDecentralizedBundle().catch(console.error);`,
    },
    responseExample: {
      filename: 'cid-result.json',
      code: `{
  "valid": true,
  "bundleHash": "0x5a1829...01",
  "anchorTx": "0x7890ab...cd",
  "details": {
    "vcPresent": true,
    "issuer": "did:proofrails:flare:0x0690...f4d8"
  }
}`,
    },
    bestPractices: 'If your organization enforces zero reliance on central web servers, use the IPFS store option so your evidence packages can be reconstructed anywhere.',
  },

  agents: {
    id: 'agents',
    category: 'Autonomous AI Agents',
    title: 'Agent Registration & Anchoring',
    lead: 'Configure autonomous AI agents that pay for tools, trigger payment receipts, and anchor operational records on Flare.',
    overview: 'Autonomous agents need identity, billing rules, and verifiable logs. The agents module lets you register an agent wallet, define custom pricing rules, monitor agent spending, and anchor arbitrary agent outputs directly to the Flare blockchain.',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Descriptive human-readable agent name.' },
      { name: 'walletAddress', type: 'string', required: true, description: 'EVM wallet address controlled by the agent.' },
      { name: 'xmtpAddress', type: 'string', required: false, description: 'Optional XMTP messaging address for agent-to-agent communication.' },
      { name: 'pricingRules', type: 'Record<string, string>', required: false, description: 'Key-value map defining cost per tool call (e.g. { "query": "0.10" }).' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'agent-flow.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function setupAgent() {
  // 1. Register an autonomous agent
  const agent = await proofrails.agents.create({
    name: 'Invoice Reconciliation Bot',
    walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    xmtpAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    pricingRules: {
      reconcile: '0.05',
      export_iso: '0.10',
    },
  });

  console.log('Registered Agent ID:', agent.id);

  // 2. Anchor arbitrary operational agent data to Flare
  const anchorResult = await proofrails.agents.anchorData(
    agent.id,
    {
      action: 'BATCH_RECONCILIATION_COMPLETED',
      matchedCount: 42,
      varianceAmount: '0.00',
      timestamp: Date.now(),
    },
    {
      description: 'Q4 Mid-Month Payroll Reconciliation Log',
      chain: 'coston2',
      submitOnchain: true,
    }
  );

  console.log('Agent Data Anchored:');
  console.log('Bundle Hash:', anchorResult.bundle_hash);
  console.log('Flare Tx ID:', anchorResult.flare_txid);
}

setupAgent().catch(console.error);`,
    },
    responseExample: {
      filename: 'agent-anchor.json',
      code: `{
  "bundle_hash": "0x12a948c0b7e8...ef",
  "flare_txid": "0x9812bc87...fa",
  "status": "anchored",
  "description": "Q4 Mid-Month Payroll Reconciliation Log"
}`,
    },
    bestPractices: 'Set submitOnchain to true when you need immediate on-chain settlement for an agent audit log.',
  },

  'agent-ai': {
    id: 'agent-ai',
    category: 'Autonomous AI Agents',
    title: 'AI Command Parsing',
    lead: 'Translate unstructured conversational requests into structured middleware actions using the system AI parser.',
    overview: 'Allow your human operators or chat interfaces to send plain English instructions like "refund receipt abc123 because duplicate payment" and receive structured JSON parameters ready for SDK execution.',
    codeExample: {
      language: 'typescript',
      filename: 'parse-command.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function parseUserInput() {
  const result = await proofrails.platform.parseCommand(
    'show me the latest 5 receipts for enterprise clients'
  );

  console.log('Parsed Action:', result.action);
  console.log('Arguments:', result.args);
}

parseUserInput().catch(console.error);`,
    },
    responseExample: {
      filename: 'parsed.json',
      code: `{
  "action": "list",
  "args": {
    "limit": 5,
    "tags": ["enterprise"]
  }
}`,
    },
    bestPractices: 'Use the optional systemPrompt parameter in parseCommand to teach the parser domain-specific actions unique to your proprietary dApp.',
  },

  x402: {
    id: 'x402',
    category: 'x402 Micropayments',
    title: 'x402 Pay-Per-Request Protocol',
    lead: 'Native client helpers for payment-gated APIs. Handle HTTP 402 Payment Required flows with microtransactions on Base or Flare.',
    overview: 'The x402 specification enables pay-per-use API endpoints without monthly subscriptions or API token top-ups. When an endpoint requires payment, the client attaches an X-PAYMENT header containing transaction proof of payment.',
    parameters: [
      { name: 'txHash', type: 'string', required: true, description: 'On-chain hash of the micropayment transfer.' },
      { name: 'amount', type: 'string', required: true, description: 'Payment amount sent (e.g. "0.01").' },
      { name: 'recipient', type: 'string', required: true, description: 'Wallet address of the API service provider.' },
      { name: 'currency', type: 'string', required: false, description: 'Asset symbol (defaults to USDC on Base, or FLR on Flare).' },
      { name: 'chain', type: 'string', required: false, description: 'Target chain (defaults to base).' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'x402-client.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function callPaymentGatedApi() {
  // 1. Fetch current price catalog for premium endpoints
  const pricing = await proofrails.x402.pricing();
  console.log('Active endpoint prices:', pricing);

  // 2. Prepare payment proof object after sending transaction in wallet
  const paymentProof = {
    txHash: '0xabc123...456',
    amount: '0.01',
    recipient: '0x1234567890123456789012345678901234567890',
    currency: 'USDC',
    chain: 'base',
  };

  // 3. Serialize header for raw fetch requests
  const headerValue = proofrails.x402.paymentHeader(paymentProof);
  console.log('X-PAYMENT Header Value:', headerValue);

  // 4. Test payment proof validity with middleware
  const verification = await proofrails.x402.verifyPayment(paymentProof);
  console.log('Payment verified:', verification.verified);
}

callPaymentGatedApi().catch(console.error);`,
    },
    responseExample: {
      filename: 'x402-verification.json',
      code: `{
  "verified": true,
  "paymentId": "pay_9821a0",
  "txHash": "0xabc123...456"
}`,
    },
    bestPractices: 'In development, set X402_MOCK_PAYMENTS=true in the middleware .env to test premium endpoints without needing real Base USDC or Flare testnet tokens.',
  },

  'x402-premium': {
    id: 'x402-premium',
    category: 'x402 Micropayments',
    title: 'Premium x402 Endpoints',
    lead: 'Invoke advanced middleware capabilities protected by x402 payment headers.',
    overview: 'Advanced features such as bulk bundle verification, live FTSO FX conversion lookups, and pacs.004 return message generation are available as pay-per-use endpoints via the x402 module.',
    codeExample: {
      language: 'typescript',
      filename: 'premium-ops.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function runPremiumOps() {
  const payment = {
    txHash: '0x994821a4f00b9472e90c741e12d48ef01c590ad2768564177bc901e18b84310a2',
    amount: '0.05',
    recipient: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    currency: 'USDC',
    chain: 'base',
  };

  // Query live decentralized FX rate via Flare FTSO
  const fx = await proofrails.x402.premiumFxLookup(payment, {
    baseCcy: 'USD',
    quoteCcy: 'FLR',
    provider: 'ftso',
  });

  console.log('Live FTSO Exchange Rate:', fx);
}

runPremiumOps().catch(console.error);`,
    },
    responseExample: {
      filename: 'fx-output.json',
      code: `{
  "base": "USD",
  "quote": "FLR",
  "rate": "46.5116279",
  "source": "flare-ftso-v2",
  "timestamp": 1729000000
}`,
    },
    bestPractices: 'The SDK automatically adds the X-PAYMENT header for all methods prefixed with premium in the x402 module.',
  },

  statements: {
    id: 'statements',
    category: 'Financial Reporting',
    title: 'ISO Statements (camt.052 & camt.053)',
    lead: 'Generate banking-standard account statements directly from on-chain transaction records.',
    overview: 'Financial institutions require standardized reporting formats. ProofRails compiles raw blockchain transactions into valid camt.052 (intraday account balance reports) and camt.053 (official end-of-day bank statements).',
    parameters: [
      { name: 'dateFrom', type: 'string', required: true, description: 'Statement target date formatted as YYYY-MM-DD.' },
      { name: 'window', type: 'string', required: false, description: 'Time window for intraday statements (e.g. "09:00-17:00").' },
      { name: 'xPayment', type: 'string', required: true, description: 'Serialized x402 payment proof header.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'statements.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function exportDailyStatement() {
  const statement = await proofrails.statements.endOfDay({
    dateFrom: '2026-10-14',
    xPayment: JSON.stringify({
      tx_hash: '0x123...456',
      amount: '0.10',
      recipient: '0x0690d8cFb1897c12B2C0b34660edBDE4E20ff4d8',
      currency: 'FLR',
      chain: 'flare',
    }),
  });

  console.log('Statement Type:', statement.type);
  console.log('Total Transactions Included:', statement.count);
  console.log('ISO camt.053 XML Content:', statement.xml.substring(0, 150) + '...');
}

exportDailyStatement().catch(console.error);`,
    },
    responseExample: {
      filename: 'statement.xml',
      code: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>STMT-2026-10-14-001</MsgId>
      <CreDtTm>2026-10-15T00:00:00Z</CreDtTm>
    </GrpHdr>
  </BkToCstmrStmt>
</Document>`,
    },
    bestPractices: 'Save statement.xml directly to disk or pass it to standard ERP software such as SAP or Oracle Financials.',
  },

  flare: {
    id: 'flare',
    category: 'Flare Protocol & AI Skills',
    title: 'Flare FTSO Rates & FDC Proofs',
    lead: 'Decentralized price feeds from FTSO v2 and Merkle-backed payment attestations via the Flare Data Connector.',
    overview: 'ProofRails integrates directly with Flare native protocols. Use the platform module to read decentralized price feeds for currency conversion or prepare Flare Data Connector (FDC) Merkle proofs verifying external blockchain transactions.',
    codeExample: {
      language: 'typescript',
      filename: 'flare-tools.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function useFlareSkills() {
  // 1. Get live FTSO v2 price feeds
  const feeds = await proofrails.platform.flareFeeds();
  console.log('Supported FTSO Feeds:', Object.keys(feeds));

  // 2. Query specific feed (e.g. FLR/USD)
  const flrPrice = await proofrails.platform.flareFeed('FLR/USD');
  console.log('FLR/USD Price:', flrPrice);

  // 3. Prepare FDC Merkle attestation payload for cross-chain verification
  const attestation = await proofrails.platform.prepareFdcAttestation({
    attestation_type: 'EVMTransaction',
    source_chain: 'eth',
    tx_hash: '0x123...456',
  });

  console.log('Prepared FDC Attestation Payload:', attestation);
}

useFlareSkills().catch(console.error);`,
    },
    responseExample: {
      filename: 'ftso-rate.json',
      code: `{
  "symbol": "FLR/USD",
  "price": "0.02150",
  "decimals": 5,
  "timestamp": 1729000000
}`,
    },
    bestPractices: 'FDC attestations provide cryptographically guaranteed verification of events on external chains like Ethereum, Bitcoin, or XRP without relying on centralized oracles.',
  },

  events: {
    id: 'events',
    category: 'Real-Time & Monitoring',
    title: 'Server-Sent Events & Embeds',
    lead: 'Real-time push updates for receipt anchoring status and embeddable verification badges.',
    overview: 'Rather than polling the API in an infinite loop, subscribe to Server-Sent Events (SSE). The events module pushes updates as soon as the evidence bundle is packaged and confirmed on Flare. The embed module produces drop-in iframes and verification URLs.',
    codeExample: {
      language: 'typescript',
      filename: 'listen-events.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

// 1. Subscribe to SSE real-time updates
const subscription = proofrails.events.listen('ce620107-5389-432e-b2ad-ab80886402fb', (update) => {
  console.log('Status Update:', update.status);

  if (update.status === 'anchored') {
    console.log('Anchored on Flare with tx:', update.anchorTx);
    subscription.stop();
  }
});

// 2. Generate embeddable HTML iframe badge
const widget = proofrails.embed.widget('ce620107-5389-432e-b2ad-ab80886402fb', {
  theme: 'dark',
  height: '350px',
});

console.log('Iframe HTML:', widget.iframeHtml);`,
    },
    responseExample: {
      filename: 'sse-event.json',
      code: `{
  "id": "ce620107-5389-432e-b2ad-ab80886402fb",
  "status": "anchored",
  "anchorTx": "0x391e48bc7201fae92817203bca01e294821a4f00b9472e90c741e12d48ef01c5",
  "bundleHash": "0xbbddce647bfe8c5704f8f9c8ba49921f7c45d8859e85f7584e915ee4d6e1b859",
  "timestamp": "2026-10-15T06:35:00.000Z"
}`,
    },
    bestPractices: 'Always call subscription.stop() once your receipt reaches terminal state to prevent lingering network sockets.',
  },

  'webhooks-monitoring': {
    id: 'webhooks-monitoring',
    category: 'Real-Time & Monitoring',
    title: 'Webhooks & Wallet Watchlist',
    lead: 'Dispatch automatic webhooks to your server and monitor on-chain wallet addresses for incoming transactions.',
    overview: 'The platform module manages server-side webhooks and address watchlists. When your monitored wallets receive payments, ProofRails automatically triggers ISO receipt generation and sends webhook payloads to your endpoints.',
    parameters: [
      { name: 'url', type: 'string', required: true, description: 'HTTPS destination endpoint for webhook events.' },
      { name: 'events', type: 'string[]', required: true, description: 'Array of event names to subscribe to.' },
      { name: 'address', type: 'string', required: true, description: '0x-prefixed wallet address to watch.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'webhooks-monitor.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function setupMonitoring() {
  // 1. Register a webhook destination
  const webhook = await proofrails.platform.createWebhook({
    url: 'https://api.myapp.com/webhooks/proofrails',
    events: ['receipt.created', 'receipt.anchored'],
    secret: 'whsec_9821ab45c',
  });
  console.log('Webhook Registered:', webhook.id);

  // 2. Add an organization wallet to the active watchlist
  await proofrails.platform.watchWallet(
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    'Main Treasury Wallet'
  );

  // 3. Query all currently monitored addresses
  const watched = await proofrails.platform.watchedWallets();
  console.log('Watched Wallets:', watched);
}

setupMonitoring().catch(console.error);`,
    },
    responseExample: {
      filename: 'webhook-registered.json',
      code: `{
  "id": "wh_01h8a9bc",
  "url": "https://api.myapp.com/webhooks/proofrails",
  "status": "active",
  "events": ["receipt.created", "receipt.anchored"]
}`,
    },
    bestPractices: 'Verify the webhook signature header on your receiving server using your configured secret to ensure payloads originate from ProofRails.',
  },

  'project-admin': {
    id: 'project-admin',
    category: 'Project & Admin',
    title: 'Projects & API Key Admin',
    lead: 'Register multi-tenant projects via Sign-In With Ethereum (SIWE), manage project configs, and mint API keys.',
    overview: 'ProofRails uses Sign-In With Ethereum (SIWE) for decentralized project ownership. Project owners can request a cryptographic nonce, sign registration messages with their wallet, configure custom anchor contracts, and mint scoped API keys for team members.',
    codeExample: {
      language: 'typescript',
      filename: 'project-management.ts',
      code: `import { ProofRails } from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function manageProject() {
  // 1. Fetch current principal / API key info
  const info = await proofrails.project.getInfo();
  console.log('Role:', info.role, 'Project ID:', info.projectId);

  // 2. Request a SIWE nonce before registering a new project
  const { nonce, domain } = await proofrails.project.getRegistrationNonce();
  console.log('SIWE Nonce:', nonce);

  // 3. Admin: mint a new scoped API key for a partner or CI/CD worker
  const newKey = await proofrails.admin.createKey({
    label: 'GitHub Actions Deployer',
  });
  console.log('Created API Key ID:', newKey.id);

  // 4. List all active API keys for this project
  const keys = await proofrails.admin.listKeys();
  console.log('Total Active Keys:', keys.length);
}

manageProject().catch(console.error);`,
    },
    responseExample: {
      filename: 'api-key-created.json',
      code: `{
  "id": "key_9821a0",
  "label": "GitHub Actions Deployer",
  "role": "project",
  "createdAt": "2026-10-15T08:10:00.000Z"
}`,
    },
    bestPractices: 'Revoke compromised API keys immediately using proofrails.admin.deleteKey(keyId).',
  },

  validation: {
    id: 'validation',
    category: 'Utilities & Validation',
    title: 'Input Validation Helpers',
    lead: 'Client-side validators for transaction hashes, amounts, wallet addresses, purposes, and complete payment payloads before making network calls.',
    overview: 'The SDK exports dedicated validation functions in @proofrails/sdk. Use them inside your form handlers or API routes to validate inputs before making network calls, preventing invalid requests and saving network round trips.',
    parameters: [
      { name: 'validateAmount', type: '(amount: string | number) => ValidationResult', required: true, description: 'Checks if amount is non-empty, a valid number, positive (>0), and within safe integer limits.' },
      { name: 'validateAddress', type: '(address: string) => ValidationResult', required: true, description: 'Validates 0x-prefixed 42-character hexadecimal Ethereum/Flare addresses.' },
      { name: 'validateTransactionHash', type: '(hash: string) => ValidationResult', required: true, description: 'Validates 0x-prefixed 66-character hexadecimal EVM transaction hashes.' },
      { name: 'validateApiKey', type: '(apiKey: string) => ValidationResult', required: true, description: 'Checks if API key is a string with at least 10 characters.' },
      { name: 'validatePurpose', type: '(purpose: string) => ValidationResult', required: true, description: 'Validates non-empty payment purpose string up to 500 characters.' },
      { name: 'validatePayment', type: '(params: { amount, to, purpose, transactionHash? }) => ValidationResult', required: true, description: 'Validates an entire payment object at once in a single call.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'validate.ts',
      code: `import {
  validateAmount,
  validateAddress,
  validateTransactionHash,
  validateApiKey,
  validatePurpose,
  validatePayment,
} from '@proofrails/sdk';

// 1. Validate payment amount
const amountResult = validateAmount(150.50);
console.log('Valid Amount:', amountResult.isValid); // true
if (!amountResult.isValid) console.error(amountResult.error);

// 2. Validate EVM wallet address
const addrResult = validateAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
console.log('Valid Address:', addrResult.isValid); // true

// 3. Validate transaction hash
const txResult = validateTransactionHash('0x94821a4f00b9472e90c741e12d48ef01c590ad2768564177bc901e18b84310a2');
console.log('Valid Tx Hash:', txResult.isValid); // true

// 4. Validate purpose string
const purposeResult = validatePurpose('Consulting Invoice October 2026');
console.log('Valid Purpose:', purposeResult.isValid); // true

// 5. Validate full payment payload at once
const paymentCheck = validatePayment({
  amount: 250,
  to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  purpose: 'Q4 Developer Grant',
  transactionHash: '0x94821a4f00b9472e90c741e12d48ef01c590ad2768564177bc901e18b84310a2',
});

if (paymentCheck.isValid) {
  console.log('Ready to submit payment!');
} else {
  console.error('Validation failed:', paymentCheck.error);
}`,
    },
    responseExample: {
      filename: 'validation-result.json',
      code: `{
  "isValid": true
}`,
    },
    bestPractices: 'Call validation helpers synchronously inside onChange or onBlur events in your frontend checkout forms to provide instant user feedback before submitting.',
  },

  'chain-utils': {
    id: 'chain-utils',
    category: 'Utilities & Validation',
    title: 'Chain & Amount Utilities',
    lead: 'Helper functions for network auto-detection, default currencies, chain metadata, and block explorer links.',
    overview: 'The SDK provides utilities in src/utils/chain.ts for working with Flare and Coston2 networks, resolving block explorer URLs, identifying default native currencies, and inspecting supported chains.',
    parameters: [
      { name: 'detectNetwork', type: '(chainId?: number) => Network', required: true, description: 'Detects network ("flare" or "coston2") from chain ID. Defaults to "coston2" if undefined.' },
      { name: 'detectCurrency', type: '(chainId?: number) => string', required: true, description: 'Detects native token symbol ("FLR" or "C2FLR") from chain ID.' },
      { name: 'getChainInfo', type: '(chainId: number) => ChainInfo | null', required: true, description: 'Returns id, name, network, currency, rpcUrl, and explorerUrl for a chain ID.' },
      { name: 'isSupportedChain', type: '(chainId: number) => boolean', required: true, description: 'Returns boolean whether chain ID is supported (14 for Flare, 114 for Coston2).' },
      { name: 'getExplorerUrl', type: '(chainId: number, txHash: string) => string', required: true, description: 'Constructs the full block explorer transaction URL.' },
      { name: 'getAddressExplorerUrl', type: '(chainId: number, address: string) => string', required: true, description: 'Constructs the full block explorer address URL.' },
      { name: 'SUPPORTED_CHAINS', type: 'Record<number, ChainInfo>', required: true, description: 'Dictionary mapping supported chain IDs (14, 114) to their full chain metadata.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'chain-utilities.ts',
      code: `import {
  detectNetwork,
  detectCurrency,
  getChainInfo,
  isSupportedChain,
  getExplorerUrl,
  getAddressExplorerUrl,
  SUPPORTED_CHAINS,
} from '@proofrails/sdk';

// 1. Detect network from wallet chain ID (114 = Coston2, 14 = Flare)
const network = detectNetwork(114);
console.log('Network:', network); // 'coston2'

// 2. Detect default currency from chain ID
const currency = detectCurrency(14);
console.log('Currency:', currency); // 'FLR'

// 3. Check if chain ID is supported
const supported = isSupportedChain(114);
console.log('Is Supported:', supported); // true

// 4. Retrieve complete chain metadata
const info = getChainInfo(114);
console.log('Chain Name:', info?.name);          // 'Coston2'
console.log('RPC Endpoint:', info?.rpcUrl);      // 'https://coston2-api.flare.network/ext/C/rpc'
console.log('Explorer:', info?.explorerUrl);     // 'https://coston2-explorer.flare.network'

// 5. Generate direct block explorer links
const txUrl = getExplorerUrl(114, '0x94821a4f00b9472e90c741e12d48ef01c590ad2768564177bc901e18b84310a2');
console.log('Transaction Link:', txUrl);

const addrUrl = getAddressExplorerUrl(114, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
console.log('Address Link:', addrUrl);`,
    },
    responseExample: {
      filename: 'console-output.txt',
      code: `Network: coston2
Currency: FLR
Is Supported: true
Chain Name: Coston2
Transaction Link: https://coston2-explorer.flare.network/tx/0x94821a4f00b9472e90c741e12d48ef01c590ad2768564177bc901e18b84310a2
Address Link: https://coston2-explorer.flare.network/address/0x70997970C51812dc3A010C7d01b50e0d17dc79C8`,
    },
    bestPractices: 'Use getExplorerUrl and getAddressExplorerUrl to give your users direct, clickable links to verified transactions on the Flare Block Explorer.',
  },

  'error-handling': {
    id: 'error-handling',
    category: 'Utilities & Validation',
    title: 'Error Codes & Friendly Resilience',
    lead: 'User-friendly error formatting, human-readable troubleshooting solutions, and the typed ProofRailsError class.',
    overview: 'The SDK provides error resolution helpers in src/utils/errors.ts (getFriendlyError and formatErrorForDisplay) alongside the core ProofRailsError class. Instead of raw SQLite or network exceptions, these helpers translate errors into clear titles, explanations, and actionable fix suggestions.',
    parameters: [
      { name: 'getFriendlyError', type: '(error: any) => FriendlyError', required: true, description: 'Parses any thrown error and returns title, message, solution, and learnMore link.' },
      { name: 'formatErrorForDisplay', type: '(error: any) => string', required: true, description: 'Formats a FriendlyError into an easily readable multi-line string with emojis and action advice.' },
      { name: 'ProofRailsError', type: 'class extends Error', required: true, description: 'Core SDK error with statusCode (e.g. 404, 401, 429) and code string.' },
    ],
    codeExample: {
      language: 'typescript',
      filename: 'error-resilience.ts',
      code: `import {
  ProofRails,
  ProofRailsError,
  getFriendlyError,
  formatErrorForDisplay,
} from '@proofrails/sdk';

const proofrails = new ProofRails({ baseUrl: 'http://127.0.0.1:8000' });

async function executeSafePayment() {
  try {
    await proofrails.receipts.get('non-existent-uuid');
  } catch (err) {
    // 1. Get structured friendly error object
    const friendly = getFriendlyError(err);
    console.log('Title:', friendly.title);
    console.log('Explanation:', friendly.message);
    console.log('How to fix:', friendly.solution);

    // 2. Or format directly for UI display or terminal alerts
    const displayText = formatErrorForDisplay(err);
    console.error(displayText);

    // 3. Inspect typed ProofRailsError details
    if (err instanceof ProofRailsError) {
      console.log('HTTP Status:', err.statusCode);
      console.log('Error Code:', err.code);
    }
  }
}

executeSafePayment().catch(console.error);`,
    },
    responseExample: {
      filename: 'error-log.txt',
      code: `🔍 Not Found
The requested resource doesn't exist.

💡 Solution: Double-check the receipt ID or resource identifier you're trying to access.
📖 Learn more: https://docs.proofrails.com/troubleshooting/not-found`,
    },
    bestPractices: 'Display friendly.solution in toast notifications or error banners so your users know immediately how to resolve payment or funding issues.',
  },

  react: {
    id: 'react',
    category: 'Frontend dApps',
    title: 'React Provider & Complete Hooks',
    lead: 'Declarative React integration featuring ProofRailsProvider, useProofRails, useProofRailsPayment, useReceiptsList, useReceiptDetails, useCreateProject, useProofRailsForm, and useRateLimitInfo.',
    overview: 'The SDK provides a complete set of React hooks exported from @proofrails/sdk/react. Wrap your application with ProofRailsProvider to share the client instance across your entire component tree.',
    parameters: [
      { name: 'ProofRailsProvider', type: 'React.FC<ProofRailsProviderProps>', required: true, description: 'Root context provider accepting apiKey, config ({ baseUrl, network, timeout }), and children.' },
      { name: 'useProofRails', type: '() => ProofRails', required: true, description: 'Returns the active ProofRails SDK client instance from context.' },
      { name: 'useProofRailsPayment', type: '() => { createPayment, send, receipt, isLoading, error }', required: true, description: 'Hook for triggering payment receipts with automated loading and error state management.' },
      { name: 'useReceiptsList', type: '(sdkOverride?) => { fetch, receipts, loading, error }', required: true, description: 'Hook for fetching and paginating historical payment receipts.' },
      { name: 'useReceiptDetails', type: '(sdkOverride?) => { fetch, receipt, loading, error }', required: true, description: 'Hook for fetching single receipt details by ID.' },
      { name: 'useCreateProject', type: '() => { create, loading, error }', required: true, description: 'Hook for registering projects with SIWE cryptographic wallet signatures.' },
      { name: 'useProofRailsForm', type: '() => { apiKey, setApiKey, recipient, setRecipient, amount, setAmount, purpose, setPurpose, resetForm }', required: true, description: 'Form state manager with localStorage persistence for apiKey.' },
      { name: 'useRateLimitInfo', type: '(sdkOverride?) => { limit, remaining, reset }', required: true, description: 'Hook for inspecting client rate limit capacity.' },
    ],
    codeExample: {
      language: 'tsx',
      filename: 'App.tsx',
      code: `import React, { useState, useEffect } from 'react';
import {
  ProofRailsProvider,
  useProofRails,
  useProofRailsPayment,
  useReceiptsList,
  useReceiptDetails,
  useProofRailsForm,
  useCreateProject,
  useRateLimitInfo,
} from '@proofrails/sdk/react';

// 1. Root Provider Setup
export function App() {
  return (
    <ProofRailsProvider
      apiKey="proofrails-local-dev-key"
      config={{
        baseUrl: 'http://127.0.0.1:8000',
        network: 'coston2',
      }}
    >
      <PaymentDashboard />
    </ProofRailsProvider>
  );
}

// 2. Payment Form using useProofRailsForm and useProofRailsPayment
function PaymentDashboard() {
  const { recipient, setRecipient, amount, setAmount, purpose, setPurpose, resetForm } = useProofRailsForm();
  const { createPayment, isLoading, error, receipt } = useProofRailsPayment();
  const { receipts, loading: loadingList, fetch: fetchReceipts } = useReceiptsList();

  useEffect(() => {
    fetchReceipts({ limit: 5 });
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment({
      amount: parseFloat(amount),
      from: 'Alice',
      to: recipient,
      purpose,
      transactionHash: '0x94821a4f00b9472e90c741e12d48ef01c590ad2768564177bc901e18b84310a2',
    });
    resetForm();
    fetchReceipts({ limit: 5 });
  };

  return (
    <div className="p-6 bg-slate-900 rounded-lg text-white max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Send ISO 20022 Payment</h2>

      <form onSubmit={handlePay} className="space-y-3">
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient Address (0x...)"
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (e.g. 100)"
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
        />
        <input
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Purpose (e.g. Freelance Design)"
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-indigo-600 rounded font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating Receipt...' : 'Submit Payment'}
        </button>
      </form>

      {receipt && (
        <p className="mt-4 text-xs text-emerald-400">Created Receipt ID: {receipt.id}</p>
      )}
      {error && (
        <p className="mt-4 text-xs text-rose-400">Error: {error.message}</p>
      )}

      {/* Receipts Table */}
      <h3 className="text-md font-semibold mt-6 mb-2">Recent Receipts</h3>
      {loadingList ? (
        <p className="text-xs text-slate-400">Loading...</p>
      ) : (
        <ul className="text-xs space-y-1 text-slate-300">
          {receipts.map((r) => (
            <li key={r.id} className="p-2 bg-slate-800/60 rounded flex justify-between">
              <span>{r.reference}</span>
              <span className="font-mono text-indigo-400">{r.amount} {r.currency}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
    },
    responseExample: {
      filename: 'console-output.txt',
      code: `Created Receipt ID: ce620107-5389-432e-b2ad-ab80886402fb
Total Receipts Loaded: 5`,
    },
    bestPractices: 'Wrap your app at the highest level possible (such as App.tsx or root layout) with ProofRailsProvider so that child components can freely consume useProofRailsPayment, useReceiptsList, and useReceiptDetails.',
  },
};
