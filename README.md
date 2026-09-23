# Email Cleaner & Verifier

A high-performance full-stack web application for cleaning, deduplicating, and verifying email lists from raw text blobs, WhatsApp messages, CSV data, or mailto links.

Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Express**, and **Node.js DNS worker pools**.

---

## Features

- **Dirty Text Extraction**: Automatically extracts email addresses embedded inside dirty text, WhatsApp messages, mailto links (`mailto:user@domain.com?subject=help`), or brackets `<john@example.com>`.
- **Zero-Width Character Removal**: Cleans hidden WhatsApp and copy-paste artifacts (`\u200b`, `\u200c`, `\u200d`, `\ufeff`).
- **Smart Deduplication**: Counts and removes duplicate entries while keeping track of aggregate stats.
- **Fast DNS Worker Pool**: Concurrent verification pool (20 workers) performing live DNS MX lookups (`dns.resolveMx`) with domain-level caching.
- **Risk Classification**: Detects disposable / throwaway domains (`mailinator.com`, `tempmail.com`) and role-based accounts (`info@`, `support@`, `sales@`, `admin@`).
- **Interactive UI**: Dark glassmorphism dashboard with status filters (`ALL`, `VALID`, `RISKY`, `INVALID`), instant search, and one-click copy.
- **Client-Side CSV Export**: Generates and triggers browser Blob CSV downloads in memory with zero server round-trips.

---

## Project Structure

```text
email-cleaner/
├── client/                  # Vite + React 18 + TS + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Stats.tsx            # Dashboard metrics cards
│   │   │   └── ResultsTable.tsx     # Filterable data table & CSV export
│   │   ├── App.tsx                  # Main app container & verification handler
│   │   ├── index.css                # Glassmorphism design system & animations
│   │   └── types.ts                 # Shared TypeScript interfaces
│   ├── vite.config.ts               # Proxy configuration (/api -> http://localhost:5000)
│   └── package.json
├── server/                  # Express + Node DNS backend
│   ├── src/
│   │   ├── index.ts                 # Express server & POST /api/verify endpoint
│   │   ├── verify.ts                # Extraction, worker pool, syntax & DNS check
│   │   └── data.ts                  # Disposable domains & role account lookup sets
│   ├── tsconfig.json
│   └── package.json
├── package.json             # Root monorepo scripts
└── render.yaml              # Deployment configuration for Render
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation

Install dependencies for root, client, and server:

```bash
# Install root dependencies
npm install

# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### Running in Development

To start both the backend server (port `5000`) and frontend Vite dev server (port `3000`) concurrently:

```bash
npm run dev
```

Alternatively, you can run them individually in separate terminal windows:

```bash
# Terminal 1 - Backend Server (http://localhost:5000)
npm run dev:server

# Terminal 2 - Frontend Client (http://localhost:3000)
npm run dev:client
```

Open `http://localhost:3000` in your browser.

---

## Production Build & Deployment

### Build Executables

```bash
# Build both server and client
npm run build
```

This compiles TypeScript for the server into `server/dist` and builds the static React application into `client/dist`.

### Run Production Server

```bash
npm start
```

The Express server will serve the API endpoints as well as the compiled client SPA from `client/dist`.

### Render Deployment

The repository includes a `render.yaml` configuration for seamless deployment on [Render](https://render.com).

---

## License

MIT License.
