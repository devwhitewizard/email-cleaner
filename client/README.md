# Email Cleaner — React Frontend Client

The user interface for the Email Cleaner application, built with **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

---

## Features & Highlights

- **Modern Glassmorphism UI**: High-contrast dark theme with glass panels, glowing accents, and smooth transitions.
- **Sample Data Loader**: Instant 1-click loading of test text containing WhatsApp spaces, mailto links, role accounts, and invalid syntaxes.
- **Dashboard Stats**: Real-time metric cards showing total found, unique count, deduped count, and percentage breakdowns for `VALID`, `RISKY`, and `INVALID` addresses.
- **Interactive Data Table**:
  - Filter tabs (`ALL`, `VALID`, `RISKY`, `INVALID`) with counter badges.
  - Real-time search box filtering by email, domain, or failure reason.
  - MX server host indicators and status badges.
  - Instant copy-to-clipboard action.
- **Zero-Server-Roundtrip CSV Export**:
  - Client-side CSV file generation using in-memory `Blob` objects.
  - Triggers hidden download links directly in browser.
  - Export options for currently filtered list or valid-only addresses.

---

## Component Architecture

```text
src/
├── components/
│   ├── Stats.tsx            # Renders total, duplicate, and color-coded status percentage cards
│   └── ResultsTable.tsx     # Data table with tabs, search, copy buttons, and CSV Blob download trigger
├── App.tsx                  # App layout, header, raw text input box, sample loader, and API caller
├── index.css                # Global glassmorphism utility classes and scrollbars
├── main.tsx                 # React application entry point
└── types.ts                 # TypeScript type definitions (VerifyResult, VerificationStats)
```

---

## Development Setup & Proxy

Vite is configured to proxy API requests from port `3000` to the Express backend on port `5000`:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Available Scripts

From the `client` directory:

- `npm run dev`: Starts Vite local development server on `http://localhost:3000`.
- `npm run build`: Runs TypeScript compiler (`tsc`) and bundles optimized static assets into `./dist`.
- `npm run preview`: Previews the production build locally.
