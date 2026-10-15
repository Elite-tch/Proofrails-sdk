# Contributing to ProofRails SDK

Thank you for your interest in contributing to the **ProofRails TypeScript SDK** (`@proofrails/sdk`) and its developer documentation!

This guide outlines our development workflow, standards, and steps for submitting contributions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [SDK Code Standards](#sdk-code-standards)
- [Documentation Standards](#documentation-standards)
- [Testing & Building](#testing--building)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and collaborative in all discussions and pull requests.

---

## Architecture Overview

The repository is structured into two main parts:

1. **SDK Core (`/src`)**:
   - `src/index.ts`: Primary entry point exporting the `ProofRails` class, templates, and utilities.
   - `src/client.ts`: HTTP client with rate-limiting, exponential backoff retries, and error transformation.
   - `src/react.ts`: React Provider (`ProofRailsProvider`) and React hooks (`useProofRails`, `useProofRailsPayment`, `useReceiptsList`, `useReceiptDetails`, etc.).
   - `src/utils/`: Input validation (`validation.ts`), Flare/Coston2 chain utilities (`chain.ts`), and user-friendly error resilience (`errors.ts`).
   - `src/types/`: TypeScript interfaces strictly typed against ISO 20022 schemas and middleware endpoints.

2. **Documentation Portal (`/docs`)**:
   - Built with React, Vite, TypeScript, and Tailwind CSS.
   - Centralized docs content managed in `docs/src/data/docsContent.ts`.

> **Note on Backend Ownership**: This SDK is the client library. It interacts with an instance of the ProofRails Middleware that developers run or self-host (see [proofrails/middleware-ISO-v2.2-and-x402](https://github.com/proofrails/middleware-ISO-v2.2-and-x402)). We do not host a shared public backend.

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (or `pnpm`, `yarn`, `bun`)
- **Git**

### 1. Fork and Clone the Repository

```bash
git clone https://github.com/<your-username>/Proofrails-sdk.git
cd Proofrails-sdk
```

### 2. Install Dependencies

Install root dependencies for building the SDK:

```bash
npm install
```

If you plan to work on the documentation website:

```bash
cd docs
npm install
cd ..
```

---

## Development Workflow

### Building the SDK

The SDK bundle is compiled using `tsup`:

```bash
# Build CommonJS (.js), ESM (.mjs), and TypeScript declaration files (.d.ts)
npm run build

# Watch mode for active development
npm run dev
```

### Type Checking

Ensure there are no TypeScript compiler errors:

```bash
npm run typecheck
```

### Running the Documentation Portal

To preview changes to documentation in your browser:

```bash
cd docs
npm run dev
```

The portal will open at `http://localhost:3000` (or `3001`).

### Testing with a Local Middleware Instance

If you are testing live receipt creation and verification against a local backend:

1. Start your local ProofRails middleware (typically running on `http://127.0.0.1:8000`).
2. Run the included test script:

```bash
npx ts-node test-sdk.ts
```

---

## SDK Code Standards

1. **Strict Typing**: Never use untyped `any` when a known interface can be defined. Keep types in `src/types/` synchronized with OpenAPI schemas.
2. **No Mock Shortcuts**: All methods must perform real operations against the middleware API or Flare smart contracts.
3. **Resilient Error Handling**: Throw typed `ProofRailsError` instances with HTTP status codes and structured error codes.
4. **Idempotency**: Maintain support for `idempotencyKey` in payment and receipt creation methods to protect against network retries.
5. **Backwards Compatibility**: Do not break public method signatures without bumping major versions.

---

## Documentation Standards

When adding or updating pages in `docs/src/data/docsContent.ts`:

- **Human Developer Tone**: Write concise, direct technical documentation. Avoid repetitive markdown bullet walls and AI filler paragraphs.
- **Copyable, Working Code**: Every code example must be valid TypeScript that can be directly pasted into an application.
- **Realistic Response Payloads**: Provide representative JSON responses reflecting real middleware outputs.
- **Brand Consistency**: Maintain the solid brand color palette (Indigo `#4f46e5`, Slate `#090d16` and `#070a12`). Avoid flashy rainbow gradients.

---

## Submitting a Pull Request

1. **Create a Topic Branch**:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make Your Changes**:
   Follow the coding guidelines and ensure `npm run build` and `npm run typecheck` both exit with code 0.

3. **Commit Your Changes**:
   Write clear, conventional commit messages:
   ```bash
   git commit -m "feat(receipts): add support for custom idempotency keys"
   ```

4. **Push to Your Fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Open a Pull Request**:
   Go to [https://github.com/Elite-tch/Proofrails-sdk/pulls](https://github.com/Elite-tch/Proofrails-sdk/pulls) and submit your PR with:
   - A clear description of the problem and the solution.
   - Any relevant issue numbers (e.g. `Fixes #12`).
   - Confirmation that `npm run build` and `npm run typecheck` pass.

---

## Reporting Issues

If you find a bug or have a feature request:

1. Check existing issues to see if it has already been reported.
2. If not, open a new issue on GitHub: [https://github.com/Elite-tch/Proofrails-sdk/issues](https://github.com/Elite-tch/Proofrails-sdk/issues).
3. Include:
   - A minimal reproducible example.
   - SDK version (`@proofrails/sdk`).
   - Node.js version and operating system.
   - Expected vs. actual behavior.
