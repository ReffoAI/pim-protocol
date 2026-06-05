/**
 * Types for the /.well-known/pim discovery convention.
 *
 * Operators expose two endpoints:
 *   /.well-known/pim          — PimDiscoveryDoc   (JSON, max-age=3600)
 *   /.well-known/pim/refs.json — PimRefsFeed       (JSON, s-maxage=300)
 *
 * Both endpoints MUST include:
 *   Content-Type: application/json
 *   Access-Control-Allow-Origin: *
 */

import type { Ref } from './types.js';

export interface PimOperator {
  name: string;
  url: string;
  support_email: string;
}

export interface PimRateLimits {
  anonymous_rps: number;
  authenticated_rps: number;
}

export interface PimCapabilities {
  /** URL of the refs catalog feed (/.well-known/pim/refs.json) */
  refs_feed: string;
  /**
   * Optional seller-checkout URL pattern. Omit or set null when the operator
   * does not host checkout (e.g. pure discovery/pairing platforms).
   */
  checkout?: string | null;
}

/**
 * Shape of the /.well-known/pim discovery document.
 *
 * Recommended headers:
 *   Cache-Control: public, max-age=3600
 *   Access-Control-Allow-Origin: *
 */
export interface PimDiscoveryDoc {
  pim_version: string;
  operator: PimOperator;
  capabilities: PimCapabilities;
  /**
   * Role of this operator in the commerce graph.
   * "pairing" = discovery/matching only; no payment processing.
   * "merchant" = direct seller; may process payments.
   */
  platform_role?: 'pairing' | 'merchant';
  /** Whether this operator processes payments on behalf of sellers. */
  processes_payments?: boolean;
  rate_limits?: PimRateLimits;
  terms?: string;
  privacy?: string;
}

/**
 * Shape of the /.well-known/pim/refs.json catalog feed.
 *
 * Recommended headers:
 *   Cache-Control: s-maxage=300
 *   Access-Control-Allow-Origin: *
 */
export interface PimRefsFeed {
  pim_version: string;
  refs: Ref[];
  /** URL for the next page of results (absent on the last page). */
  next_page_url?: string;
}

// ---------------------------------------------------------------------------
// sellerCheckoutUrl validation
// ---------------------------------------------------------------------------

/**
 * Validates a sellerCheckoutUrl value.
 *
 * PIM is a vendor-neutral protocol: it asserts only that a checkout URL is a
 * well-formed, safe https endpoint. It deliberately does NOT restrict which
 * payment provider hosts the checkout — Stripe, a BTCPay/Lightning page, or any
 * other seller-hosted processor are all conformant. Provider allowlisting is an
 * operator/product policy and belongs in the consuming application (e.g. at the
 * reffo-api serialization seam), not in the canonical protocol surface.
 *
 * Rules:
 *   - Must be a parseable URL
 *   - Must use the https scheme
 *   - Must not embed credentials (userinfo)
 *
 * Returns true when the value is undefined (field is optional).
 */
export function isValidCheckoutUrl(value: string | undefined): boolean {
  if (value === undefined) return true;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.username !== '' || url.password !== '') return false;
  return true;
}
