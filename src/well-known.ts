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
// seller_checkout_url validation
// ---------------------------------------------------------------------------

// Matches https:// followed by an optional subdomain chain, then stripe.com, then / or end
const STRIPE_URL_PATTERN = /^https:\/\/([a-zA-Z0-9-]+\.)*stripe\.com(\/|$)/;

/**
 * Validates a seller_checkout_url value.
 *
 * Rules:
 *   - Must use the https scheme
 *   - Hostname must be stripe.com or a subdomain of stripe.com
 *
 * Returns true when the value is undefined (field is optional).
 */
export function isValidSellerCheckoutUrl(value: string | undefined): boolean {
  if (value === undefined) return true;
  return STRIPE_URL_PATTERN.test(value);
}
