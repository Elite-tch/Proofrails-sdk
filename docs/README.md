# ProofRails SDK Documentation & Developer Portal

This directory contains the source code for the official documentation website and developer hub for the **ProofRails TypeScript SDK** (`@proofrails/sdk`).

Built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## Features

- **Comprehensive SDK Coverage**: Complete documentation for all 11 categories (22 modules) in `@proofrails/sdk`, including payment templates, ISO 20022 XML artifacts, on-chain verification, IPFS/Arweave storage, AI agents, x402 micropayments, financial statements, Flare FTSO v2 rates, and React hooks.
- **Realistic IDE Syntax Highlighting**: Token-based color scheme (keywords, functions, types, strings, numbers, and comments) with line numbers and one-click copy buttons.
- **Interactive Installation**: Switcher supporting `npm`, `pnpm`, `yarn`, and `bun` commands.
- **Sticky Navigation Sidebar**: Search-filtered sidebar that stays fixed in place on desktop layouts without page-scroll leakage.
- **Zero Mock Data**: All code examples, parameters, and response previews match the live SDK code and official ProofRails middleware schemas.

---

## Project Structure

```text
docs/
├── index.html                   # HTML entry point with metadata & fonts
├── package.json                 # Dependencies and scripts
├── vite.config.ts               # Vite configuration with Tailwind CSS plugin
├── tsconfig.json                # TypeScript compiler configuration
└── src/
    ├── App.tsx                  # Main app component with routing & layout
    ├── index.css                # Global styles and Tailwind imports
    ├── main.tsx                 # React DOM mount point
    ├── components/
    │   ├── CodeBlock.tsx        # Tokenized syntax-highlighted code viewer
    │   ├── DocPageView.tsx      # Documentation page layout, steps, and parameters
    │   ├── Header.tsx           # Universal navigation header with branding
    │   ├── LandingHero.tsx      # Interactive landing page and feature cards
    │   └── Sidebar.tsx          # Sticky navigation with live search filter
    └── data/
        └── docsContent.ts       # Centralized documentation content and page definitions
```

---

## Local Development

### Prerequisites

- Node.js 18+
- npm, pnpm, yarn, or bun

### 1. Install dependencies
From this directory:
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```
By default, the application runs at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use).

---

## Adding or Editing Documentation

All documentation content is managed deterministically in [`src/data/docsContent.ts`](./src/data/docsContent.ts).

### 1. Adding a New Page

1. Define the item in `DOCS_CATEGORIES`:
   ```typescript
   {
     name: 'Category Name',
     items: [
       { id: 'your-page-id', title: 'Page Title' },
     ],
   }
   ```

2. Add the corresponding page definition to `DOCS_PAGES`:
   ```typescript
   'your-page-id': {
     id: 'your-page-id',
     category: 'Category Name',
     title: 'Page Title',
     lead: 'One-sentence summary of what this module does.',
     overview: 'Detailed technical explanation without generic fluff.',
     parameters: [
       { name: 'paramName', type: 'string', required: true, description: 'Description.' },
     ],
     codeExample: {
       language: 'typescript',
       filename: 'example.ts',
       code: `// Working TypeScript code example...`,
     },
     responseExample: {
       filename: 'response.json',
       code: `// Realistic JSON response...`,
     },
     bestPractices: 'Actionable developer tip or production advice.',
   }
   ```

---

## Building for Production

To create a static production bundle:

```bash
npm run build
```

The output will be placed in `docs/dist/`. You can preview the production build locally with:

```bash
npm run preview
```

### Deployment Options

- **Vercel**: Set root directory to `docs`, build command `npm run build`, output directory `dist`.
- **Netlify**: Publish directory `docs/dist`.
- **GitHub Pages**: Deploy the built `docs/dist` folder using the GitHub Pages static deploy workflow.
