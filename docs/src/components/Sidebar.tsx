import React, { useState, useMemo } from 'react';
import { DOCS_CATEGORIES } from '../data/docsContent';

interface SidebarProps {
  activePageId: string;
  onSelectPage: (id: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePageId,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return DOCS_CATEGORIES;
    const query = search.toLowerCase();

    return DOCS_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.title.toLowerCase().includes(query) || cat.name.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  const handleItemClick = (id: string) => {
    onSelectPage(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close navigation sidebar"
          onClick={onCloseMobile}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') onCloseMobile?.(); }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Permanently Sticky Desktop Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-72 flex-shrink-0 flex flex-col border-r border-slate-800 bg-[#090d16] lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:self-start lg:translate-x-0 transition-transform duration-200 overflow-hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-slate-800 flex-shrink-0">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documentation..."
              id="sidebar-search-input"
              className="w-full rounded-md border border-slate-800 bg-slate-900/80 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No matching pages found.
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.name} className="space-y-1">
                <h4 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                  {category.name}
                </h4>

                <div className="space-y-0.5">
                  {category.items.map((item) => {
                    const isActive = activePageId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        id={`sidebar-nav-${item.id}`}
                        className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3.5 py-2.5 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between flex-shrink-0">
          <span>ProofRails SDK</span>
          <span className="font-mono text-slate-400">v1.6.4</span>
        </div>
      </aside>
    </>
  );
};
