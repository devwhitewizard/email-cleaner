# Email Cleaner — Express Backend Server

The backend service for the Email Cleaner application, built with **Express**, **TypeScript**, and **Node.js Native DNS module**.

---

## Technical Overview

The backend exposes a REST API endpoint that receives raw text payload, extracts email addresses, normalizes messy formatting, deduplicates entries, performs concurrent DNS lookups via a worker pool, and classifies risk levels.

---

## API Specification

### `POST /api/verify`

Processes a raw text string and returns verified email records along with summary statistics.

#### Request Headers
- `Content-Type: application/json`

#### Request Body
```json
{
  "text": "John Doe <john.doe@gmail.com>\nsupport@google.com\nmailto:info@mailinator.com?subject=test"
}
```

#### Response (200 OK)
```json
{
  "results": [
    {
      "id": "email-0-1790167746385",
      "email": "john.doe@gmail.com",
      "localPart": "john.doe",
      "domain": "gmail.com",
      "status": "VALID",
      "reason": "Syntax + MX ok",
      "mxHost": "gmail-smtp-in.l.google.com"
    },
    {
      "id": "email-1-1790167746387",
      "email": "support@google.com",
      "localPart": "support",
      "domain": "google.com",
      "status": "RISKY",
      "reason": "Role account (support@)",
      "mxHost": "smtp.google.com"
    },
    {
      "id": "email-2-1790167746388",
      "email": "info@mailinator.com",
      "localPart": "info",
      "domain": "mailinator.com",
      "status": "RISKY",
      "reason": "Disposable / throwaway email domain",
      "mxHost": "mail2.mailinator.com"
    }
  ],
  "stats": {
    "total": 3,
    "unique": 3,
    "duplicates": 0,
    "VALID": 1,
    "RISKY": 2,
    "INVALID": 0
  }
}
```

---

## Verification Pipeline Logic

### Step 1: Address Extraction & Normalization (`extractAddresses`)
- Strips zero-width characters (`\u200b`, `\u200c`, `\u200d`, `\ufeff`).
- Global regex pattern extraction for email strings.
- Strips surrounding brackets and punctuation (`<>()[]"'.,;:`).
- Removes `mailto:` prefix and `?query` suffix.
- Lowercases domain parts.
- Deduplicates addresses using a JavaScript `Set` while tracking `duplicatesCount`.

### Step 2: Verification Engine & Worker Pool (`verifyMany`)
- Concurrency worker pool (20 parallel tasks) using atomic queue indexes.
- **Syntax Check (Step A)**: Validates total length (≤254), local part length (≤64), single `@` sign, no consecutive dots (`..`). Fast fail without network lookup.
- **DNS Resolution (Step B)**: Uses `dns.promises.resolveMx(domain)` to fetch MX records (selecting lowest priority exchange). Fallback to `resolve4`/`resolve6` A-records if no MX exists.
- **Domain DNS Cache**: Caches domain lookup results in memory (`Map<string, DnsResult>`), accelerating resolution for common domain providers.

### Step 3: Risk Classification (Step C)
- Checks domain against `DISPOSABLE_DOMAINS` set (e.g. `mailinator.com`, `tempmail.com`, `10minutemail.com`).
- Checks local part against `ROLE_LOCAL_PARTS` set (e.g. `info`, `support`, `admin`, `sales`, `noreply`).
- Assigns status: `VALID`, `RISKY`, or `INVALID`.

---

## Available Scripts

From the `server` directory:

- `npm run dev`: Starts `ts-node-dev` with live reload on port `5000`.
- `npm run build`: Compiles TypeScript code into JavaScript inside `./dist`.
- `npm start`: Runs production compiled server (`node dist/index.js`).
