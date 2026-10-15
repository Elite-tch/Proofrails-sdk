import React, { useState, useMemo } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  id?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
  id,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // High quality syntax tokenization for realistic developer theme
  const highlightedTokens = useMemo(() => {
    const lines = code.trim().split('\n');

    return lines.map((line, lineIndex) => {
      // Handle comments
      if (line.trim().startsWith('//')) {
        return (
          <div key={lineIndex} className="table-row">
            <span className="table-cell select-none pr-4 text-right text-xs font-mono text-slate-600 opacity-60">
              {lineIndex + 1}
            </span>
            <span className="table-cell text-slate-500 italic">{line}</span>
          </div>
        );
      }

      // Tokenize by string literals, keywords, numbers, punctuation
      const tokens = line.split(/('(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`|\/\/.*$)/g);

      return (
        <div key={lineIndex} className="table-row">
          <span className="table-cell select-none pr-4 text-right text-xs font-mono text-slate-600 opacity-60">
            {lineIndex + 1}
          </span>
          <span className="table-cell">
            {tokens.map((token, tokenIdx) => {
              if (!token) return null;

              // Comment at end of line
              if (token.startsWith('//')) {
                return <span key={tokenIdx} className="text-slate-500 italic">{token}</span>;
              }

              // String literal
              if (
                (token.startsWith("'") && token.endsWith("'")) ||
                (token.startsWith('"') && token.endsWith('"')) ||
                (token.startsWith('`') && token.endsWith('`'))
              ) {
                return <span key={tokenIdx} className="text-emerald-400">{token}</span>;
              }

              // Sub-tokenize words and punctuation
              const words = token.split(/(\b(?:import|from|const|let|var|async|await|function|return|export|default|new|typeof|interface|type|extends|implements|true|false|null|undefined)\b|[{}()[\].,:;=+\-*/<>])/g);

              return (
                <span key={tokenIdx}>
                  {words.map((word, wordIdx) => {
                    // Reserved Keywords
                    if (/^(import|from|const|let|var|async|await|function|return|export|default|new|typeof|interface|type|extends|implements)$/.test(word)) {
                      return <span key={wordIdx} className="text-purple-400 font-semibold">{word}</span>;
                    }
                    // Booleans and primitives
                    if (/^(true|false|null|undefined)$/.test(word)) {
                      return <span key={wordIdx} className="text-amber-400">{word}</span>;
                    }
                    // Numbers
                    if (/^\b\d+(?:\.\d+)?\b$/.test(word)) {
                      return <span key={wordIdx} className="text-amber-400">{word}</span>;
                    }
                    // Types / Constructors (Capitalized)
                    if (/^[A-Z][a-zA-Z0-9_]*$/.test(word)) {
                      return <span key={wordIdx} className="text-cyan-300 font-medium">{word}</span>;
                    }
                    // Function calls
                    if (/^[a-z][a-zA-Z0-9_]*(?=\()/.test(word)) {
                      return <span key={wordIdx} className="text-blue-400">{word}</span>;
                    }
                    // Object keys or standard properties
                    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word)) {
                      return <span key={wordIdx} className="text-slate-200">{word}</span>;
                    }
                    // Operators & Punctuation
                    return <span key={wordIdx} className="text-slate-400">{word}</span>;
                  })}
                </span>
              );
            })}
          </span>
        </div>
      );
    });
  }, [code]);

  return (
    <div className="my-5 rounded-lg border border-slate-800 bg-[#0c111c] shadow-lg overflow-hidden" id={id}>
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#090d16] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-slate-400">
            {filename || language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          id={id ? `${id}-copy-btn` : undefined}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
            copied
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-[#0c111c]">
        <div className="table w-full border-collapse">
          {highlightedTokens}
        </div>
      </div>
    </div>
  );
};
