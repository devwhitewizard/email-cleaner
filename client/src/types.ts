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

export interface VerificationStats {
  total: number;
  unique: number;
  duplicates: number;
  VALID: number;
  RISKY: number;
  INVALID: number;
}
