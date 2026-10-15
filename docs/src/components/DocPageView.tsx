import React, { useState } from 'react';
import { DocPage, DOCS_CATEGORIES } from '../data/docsContent';
import { CodeBlock } from './CodeBlock';

interface DocPageViewProps {
  page: DocPage;
  onNavigatePage: (id: string) => void;
}

export const DocPageView: React.FC<DocPageViewProps> = ({ page, onNavigatePage }) => {
  const [activePkg, setActivePkg] = useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
  const [copiedPkg, setCopiedPkg] = useState(false);

  const installCommands = {
    npm: 'npm install @proofrails/sdk viem',
    pnpm: 'pnpm add @proofrails/sdk viem',
    yarn: 'yarn add @proofrails/sdk viem',
    bun: 'bun add @proofrails/sdk viem',
  };

  const handleCopyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installCommands[activePkg]);
      setCopiedPkg(true);
      setTimeout(() => setCopiedPkg(false), 2000);
    } catch {
      // Fallback
    }
  };

  const allPages = DOCS_CATEGORIES.flatMap((c) => c.items);
  const currentIndex = allPages.findIndex((p) => p.id === page.id);
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return (
    <article className="max-w-3xl pb-20">
      {/* Compact Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 font-mono">
        <span>Docs</span>
        <span>/</span>
        <span>{page.category}</span>
        <span>/</span>
        <span className="text-slate-300">{page.title}</span>
      </div>

      {/* Clean Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        {page.title}
      </h1>

      {/* Concise Lead Paragraph */}
      <p className="text-sm text-slate-300 leading-relaxed pb-4 border-b border-slate-800 mb-6">
        {page.lead}
      </p>

      {/* Overview */}
      <div className="mb-6">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {page.overview}
        </p>
      </div>

      {/* Interactive Installation Snippet Box on Quickstart */}
      {page.id === 'quickstart' && (
        <div className="mb-6 rounded-lg border border-slate-800 bg-[#090d16] p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
              Package Installation
            </span>
            <div className="flex items-center gap-1 rounded bg-slate-900/80 p-0.5 border border-slate-800">
              {(['npm', 'pnpm', 'yarn', 'bun'] as const).map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => setActivePkg(pkg)}
                  className={`px-2 py-0.5 text-xs font-mono rounded transition ${
                    activePkg === pkg
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pkg}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded bg-slate-950 px-3.5 py-2.5 border border-slate-800/80 font-mono text-xs text-slate-200">
            <span className="text-indigo-400 mr-2 select-none">$</span>
            <span className="flex-1 overflow-x-auto select-all">{installCommands[activePkg]}</span>
            <button
              onClick={handleCopyInstall}
              className="ml-3 flex-shrink-0 text-xs text-slate-400 hover:text-white transition flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700"
            >
              {copiedPkg ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Steps (if present) */}
      {page.steps && page.steps.length > 0 && (
        <div className="mb-6 space-y-2.5">
          {page.steps.map((step) => (
            <div key={step.number} className="flex gap-3 rounded-md border border-slate-800/80 bg-[#0c111c] p-3 text-xs sm:text-sm">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-slate-800 font-mono text-xs font-semibold text-slate-300">
                {step.number}
              </span>
              <div>
                <span className="font-semibold text-white block mb-0.5">{step.title}</span>
                <span className="text-slate-400">{step.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Code Example */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Code Example
          </span>
        </div>
        <CodeBlock
          code={page.codeExample.code}
          language={page.codeExample.language}
          filename={page.codeExample.filename}
          id={`doc-code-${page.id}`}
        />
      </div>

      {/* Parameters Table */}
      {page.parameters && page.parameters.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono mb-2">
            Parameters
          </h2>
          <div className="overflow-x-auto rounded-md border border-slate-800 bg-[#0c111c]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-[#090d16] font-mono text-slate-400">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Required</th>
                  <th className="px-3 py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
                {page.parameters.map((param) => (
                  <tr key={param.name} className="hover:bg-slate-800/20">
                    <td className="px-3 py-2 font-mono font-medium text-slate-200">
                      {param.name}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-400">
                      {param.type}
                    </td>
                    <td className="px-3 py-2">
                      {param.required ? (
                        <span className="text-rose-400 font-medium">Yes</span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {param.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Output Response */}
      {page.responseExample && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-1">
            Expected Output
          </h2>
          <CodeBlock
            code={page.responseExample.code}
            language="json"
            filename={page.responseExample.filename}
            id={`doc-response-${page.id}`}
          />
        </div>
      )}

      {/* Note / Tip Callout */}
      <div className="rounded-md border border-slate-800 bg-[#0c111c] p-3 text-xs text-slate-300 mb-8">
        <span className="font-semibold text-indigo-400 block mb-1">Note:</span>
        <p className="leading-relaxed text-slate-400">
          {page.bestPractices}
        </p>
      </div>

      {/* Prev / Next Page Footer */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs">
        {prevPage ? (
          <button
            onClick={() => onNavigatePage(prevPage.id)}
            id="doc-prev-page-btn"
            className="flex items-center gap-2 rounded px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition cursor-pointer"
          >
            <span>←</span>
            <span>{prevPage.title}</span>
          </button>
        ) : <div />}

        {nextPage && (
          <button
            onClick={() => onNavigatePage(nextPage.id)}
            id="doc-next-page-btn"
            className="flex items-center gap-2 rounded px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition cursor-pointer"
          >
            <span>{nextPage.title}</span>
            <span>→</span>
          </button>
        )}
      </div>
    </article>
  );
};
