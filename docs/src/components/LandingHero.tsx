import React, { useState } from 'react';

interface LandingHeroProps {
  onOpenDocs: (pageId?: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenDocs }) => {
  const [activePkg, setActivePkg] = useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
  const [copied, setCopied] = useState(false);

  const installCommands = {
    npm: 'npm install @proofrails/sdk viem',
    pnpm: 'pnpm add @proofrails/sdk viem',
    yarn: 'yarn add @proofrails/sdk viem',
    bun: 'bun add @proofrails/sdk viem',
  };

  const handleCopyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installCommands[activePkg]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const sdkFeatures = [
    {
      id: 'receipts',
      title: 'Payment Receipts',
      desc: 'Turn any on-chain transaction hash into an audit-ready ISO 20022 payment record with 15 supported message types.',
    },
    {
      id: 'verification',
      title: 'On-Chain Verification',
      desc: 'Cryptographically verify evidence bundles against Flare mainnet or testnet anchors with zero third-party trust required.',
    },
    {
      id: 'agents',
      title: 'Autonomous AI Agents',
      desc: 'Register and orchestrate AI agents that can pay for services, parse natural language commands, and anchor arbitrary operational data on-chain.',
    },
    {
      id: 'x402',
      title: 'x402 Pay-Per-Request',
      desc: 'Native client support for HTTP 402 payment-gated APIs. Pay with USDC on Base or FLR on Flare via simple header serialization.',
    },
    {
      id: 'statements',
      title: 'Financial Statements',
      desc: 'Generate banking-standard camt.052 intraday and camt.053 end-of-day account balance statements directly from on-chain history.',
    },
    {
      id: 'flare',
      title: 'Flare AI & FTSO Feeds',
      desc: 'Access decentralized FTSO v2 exchange rates and prepare Merkle-backed Flare Data Connector (FDC) payment attestations.',
    },
    {
      id: 'events',
      title: 'Real-Time SSE Events',
      desc: 'Subscribe to live Server-Sent Events to receive push notifications when receipts transition from pending to anchored on Flare.',
    },
    {
      id: 'react',
      title: 'React Provider & Hooks',
      desc: 'Plug-and-play React library with useReceipt, useReceipts, useVerifyReceipt, and useX402Payment for modern frontend dApps.',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      
      {/* ── Hero Section ────────────────────────────── */}
      <div className="mx-auto max-w-3xl text-center">
        
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-mono text-slate-300 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          <span>ProofRails SDK v1.6.1</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
          Turn On-Chain Payments into Audit-Grade ISO Records
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
          The developer toolkit for generating bank-compatible payment evidence, anchoring cryptographic proofs on Flare, and integrating autonomous agent workflows.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenDocs('quickstart')}
            id="hero-get-started-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition cursor-pointer"
          >
            <span>Read Documentation</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <button
            onClick={() => onOpenDocs('templates')}
            id="hero-view-examples-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <span>Explore Templates</span>
          </button>
        </div>

      </div>

      {/* ── Installation Snippet ────────────────────── */}
      <div className="mx-auto mt-12 max-w-xl">
        <div className="rounded-lg border border-slate-800 bg-[#0c111c] p-4">
          
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
              Installation
            </span>

            {/* Package Manager Tabs */}
            <div className="flex rounded bg-slate-900 p-0.5 border border-slate-800">
              {(['npm', 'pnpm', 'yarn', 'bun'] as const).map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => setActivePkg(pkg)}
                  className={`rounded px-2.5 py-0.5 text-xs font-medium transition cursor-pointer ${
                    activePkg === pkg
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pkg}
                </button>
              ))}
            </div>
          </div>

          {/* Command Box */}
          <div className="flex items-center justify-between rounded border border-slate-800 bg-[#090d16] px-3.5 py-2.5 font-mono text-xs text-indigo-300">
            <span className="truncate mr-3 select-all">
              {installCommands[activePkg]}
            </span>
            <button
              onClick={handleCopyInstall}
              id="install-copy-btn"
              className="flex-shrink-0 flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

        </div>
      </div>

      {/* ── What This SDK Contains ──────────────────── */}
      <div className="mt-20">
        
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            What This SDK Contains
          </h2>
          <p className="mt-1 text-slate-400 text-xs sm:text-sm">
            Core modules organized into dedicated, typed namespaces.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sdkFeatures.map((feat) => (
            <div
              key={feat.id}
              onClick={() => onOpenDocs(feat.id)}
              className="flex flex-col rounded-lg border border-slate-800 bg-[#0c111c] p-4 transition hover:border-slate-700 hover:bg-slate-900/60 cursor-pointer"
            >
              <h3 className="text-sm font-bold text-white mb-1.5">
                {feat.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                {feat.desc}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400">
                <span>View Guide</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
