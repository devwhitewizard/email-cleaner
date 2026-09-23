import dns from 'dns';
import { DISPOSABLE_DOMAINS, ROLE_LOCAL_PARTS } from './data';

export type VerificationStatus = 'VALID' | 'RISKY' | 'INVALID';

export interface VerifyResult {
  id: string;
  email: string;
  localPart: string;
  domain: string;
  status: VerificationStatus;
  reason: string;
  mxHost?: string;
}

export interface ExtractResult {
  addresses: string[];
  duplicatesCount: number;
}

interface DnsResult {
  hasMailServer: boolean;
  mxHost?: string;
}

const dnsCache = new Map<string, DnsResult>();

/**
 * Step 3: Extract and normalize email addresses from arbitrary text blob
 */
export function extractAddresses(rawText: string): ExtractResult {
  if (!rawText || typeof rawText !== 'string') {
    return { addresses: [], duplicatesCount: 0 };
  }

  // 1. Strip zero-width characters (WhatsApp / copy-paste artifacts)
  const cleanedText = rawText.replace(/[\u200b\u200c\u200d\ufeff]/g, '');

  // 2. Extract potential email patterns
  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const rawMatches = cleanedText.match(EMAIL_REGEX) || [];

  const uniqueSet = new Set<string>();
  const addresses: string[] = [];
  let duplicatesCount = 0;

  for (const rawMatch of rawMatches) {
    let email = rawMatch;

    // Remove mailto: prefix if attached
    if (email.toLowerCase().startsWith('mailto:')) {
      email = email.slice(7);
    }

    // Strip ?query suffix if attached
    const queryIndex = email.indexOf('?');
    if (queryIndex !== -1) {
      email = email.slice(0, queryIndex);
    }

    // Strip leading & trailing punctuation: < > ( ) [ ] " ' . , ; :
    email = email.replace(/^[<>\(\)\[\]"'\.,;:]+|[<>\(\)\[\]"'\.,;:]+$/g, '');

    const parts = email.split('@');
    if (parts.length !== 2) continue;

    const localPart = parts[0];
    const domainPart = parts[1].toLowerCase();
    const normalizedEmail = `${localPart}@${domainPart}`;

    if (!normalizedEmail || localPart.length === 0 || domainPart.length === 0) {
      continue;
    }

    if (uniqueSet.has(normalizedEmail)) {
      duplicatesCount++;
    } else {
      uniqueSet.add(normalizedEmail);
      addresses.push(normalizedEmail);
    }
  }

  return { addresses, duplicatesCount };
}

/**
 * Step 4: Verify single email syntax, DNS MX records, and risk level
 */
export async function verifyOne(email: string, id: string): Promise<VerifyResult> {
  const parts = email.split('@');
  const localPart = parts[0] || '';
  const domain = (parts[1] || '').toLowerCase();

  // Step A - Syntax Check
  if (
    email.length > 254 ||
    parts.length !== 2 ||
    !localPart ||
    !domain ||
    localPart.length > 64 ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..') ||
    domain.includes('..') ||
    !/^[a-zA-Z0-9._%+-]+$/.test(localPart) ||
    !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)
  ) {
    return {
      id,
      email,
      localPart,
      domain,
      status: 'INVALID',
      reason: 'Invalid email syntax'
    };
  }

  // Step B - DNS MX lookup with domain caching
  let dnsRes = dnsCache.get(domain);

  if (!dnsRes) {
    try {
      const mxRecords = await dns.promises.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        // Sort by priority ascending, pick lowest priority record
        mxRecords.sort((a, b) => a.priority - b.priority);
        dnsRes = {
          hasMailServer: true,
          mxHost: mxRecords[0].exchange
        };
      } else {
        dnsRes = await checkARecord(domain);
      }
    } catch {
      dnsRes = await checkARecord(domain);
    }

    dnsCache.set(domain, dnsRes);
  }

  if (!dnsRes.hasMailServer) {
    return {
      id,
      email,
      localPart,
      domain,
      status: 'INVALID',
      reason: 'Domain has no mail server (no MX/A record)'
    };
  }

  // Step C - Risk classification (Disposable domains and Role accounts)
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      id,
      email,
      localPart,
      domain,
      status: 'RISKY',
      reason: 'Disposable / throwaway email domain',
      mxHost: dnsRes.mxHost
    };
  }

  if (ROLE_LOCAL_PARTS.has(localPart.toLowerCase())) {
    return {
      id,
      email,
      localPart,
      domain,
      status: 'RISKY',
      reason: `Role account (${localPart}@)`,
      mxHost: dnsRes.mxHost
    };
  }

  return {
    id,
    email,
    localPart,
    domain,
    status: 'VALID',
    reason: 'Syntax + MX ok',
    mxHost: dnsRes.mxHost
  };
}

async function checkARecord(domain: string): Promise<DnsResult> {
  try {
    const aRecords = await dns.promises.resolve4(domain);
    if (aRecords && aRecords.length > 0) {
      return { hasMailServer: true, mxHost: domain };
    }
  } catch {
    // ignore
  }

  try {
    const aaaaRecords = await dns.promises.resolve6(domain);
    if (aaaaRecords && aaaaRecords.length > 0) {
      return { hasMailServer: true, mxHost: domain };
    }
  } catch {
    // ignore
  }

  return { hasMailServer: false };
}

/**
 * Step 4 Worker Pool: Concurrently process emails using a shared queue index
 */
export async function verifyMany(addresses: string[], concurrency = 20): Promise<VerifyResult[]> {
  const results: VerifyResult[] = new Array(addresses.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < addresses.length) {
      const idx = currentIndex++;
      const email = addresses[idx];
      const id = `email-${idx}-${Date.now()}`;
      results[idx] = await verifyOne(email, id);
    }
  }

  const workerCount = Math.min(concurrency, addresses.length);
  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  return results;
}
