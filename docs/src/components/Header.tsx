import React from 'react';

interface HeaderProps {
  onNavigateDocs: () => void;
  onNavigateHome: () => void;
  isDocsView: boolean;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateDocs,
  onNavigateHome,
  isDocsView,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-slate-800 bg-[#090d16] select-none">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {isDocsView && onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle Navigation Sidebar"
              id="mobile-sidebar-toggle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}

          <div 
            onClick={onNavigateHome} 
            className="flex items-center gap-2.5 cursor-pointer group"
            id="brand-home-btn"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition group-hover:bg-indigo-500">
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-base font-bold tracking-tight text-white group-hover:text-slate-200 transition">
                ProofRails
              </span>
              <span className="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-300">
                SDK
              </span>
            </div>
          </div>
        </div>

        {/* Right: Docs Button + Contribute on GitHub Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateDocs}
            id="header-docs-btn"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              isDocsView
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>Docs</span>
          </button>

          <a
            href="https://github.com/Elite-tch/Proofrails-sdk"
            target="_blank"
            rel="noopener noreferrer"
            id="header-contribute-github-btn"
            className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden sm:inline">Contribute on GitHub</span>
            <span className="sm:hidden">GitHub</span>
          </a>
        </div>

      </div>
    </header>
  );
};
