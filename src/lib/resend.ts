import { Resend } from 'resend';

let resendClient: Resend | null = null;

/**
 * Lazy-initialized Resend client.
 * Returns null if RESEND_API_KEY is not configured (instead of crashing at import time).
 */
export function getResend(): Resend | null {
  if (resendClient) return resendClient;

  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('RESEND_API_KEY is not defined — email sending is disabled');
    }
    return null;
  }

  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}
