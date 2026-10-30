import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { Sidebar } from './components/Sidebar';
import { DocPageView } from './components/DocPageView';
import { DOCS_PAGES } from './data/docsContent';

export function App() {
  const [view, setView] = useState<'landing' | 'docs'>('landing');
  const [activePageId, setActivePageId] = useState<string>('quickstart');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync hash routing on initial load and hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && DOCS_PAGES[hash]) {
        setActivePageId(hash);
        setView('docs');
      } else if (hash === 'docs') {
        setView('docs');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToDocs = (pageId = 'quickstart') => {
    setActivePageId(pageId);
    setView('docs');
    window.location.hash = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setView('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPage = (id: string) => {
    setActivePageId(id);
    window.location.hash = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = DOCS_PAGES[activePageId] || DOCS_PAGES['quickstart'];

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Universal Header */}
      <Header
        isDocsView={view === 'docs'}
        onNavigateDocs={() => navigateToDocs('quickstart')}
        onNavigateHome={navigateToHome}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Content Area */}
      {view === 'landing' ? (
        <main id="main-content" className="flex-1" aria-label="Main content">
          <LandingHero onOpenDocs={(pageId) => navigateToDocs(pageId || 'quickstart')} />
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl mx-auto w-full items-start">
          {/* Permanently Sticky Sidebar */}
          <Sidebar
            activePageId={activePageId}
            onSelectPage={handleSelectPage}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Documentation Page Content */}
          <main id="main-content" className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8" aria-label="Documentation content">
            <DocPageView
              page={currentPage}
              onNavigatePage={handleSelectPage}
            />
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#090d16] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">ProofRails TypeScript SDK</span>
            <span>•</span>
            <span>ISO 20022 & Flare Anchoring</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Elite-tch/Proofrails-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition"
            >
              GitHub
            </a>
            <button
              onClick={() => navigateToDocs('quickstart')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              API Reference
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
