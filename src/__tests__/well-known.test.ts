import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isValidCheckoutUrl } from '../well-known.js';
import { PAYMENT_METHODS } from '../types.js';

describe('isValidCheckoutUrl', () => {
  it('accepts undefined (field is optional)', () => {
    expect(isValidCheckoutUrl(undefined)).toBe(true);
  });

  it('accepts a Stripe checkout URL', () => {
    expect(isValidCheckoutUrl('https://buy.stripe.com/test_abc123')).toBe(true);
  });

  it('accepts a non-Stripe https checkout URL (provider-neutral)', () => {
    expect(isValidCheckoutUrl('https://checkout.example.com/pay/abc')).toBe(true);
  });

  it('accepts a BTCPay/Lightning-style https checkout URL', () => {
    expect(isValidCheckoutUrl('https://pay.myshop.io/i/invoice123')).toBe(true);
  });

  it('rejects http:// (not https)', () => {
    expect(isValidCheckoutUrl('http://checkout.example.com/pay')).toBe(false);
  });

  it('rejects a URL with embedded credentials (userinfo)', () => {
    expect(isValidCheckoutUrl('https://user:pass@checkout.example.com/pay')).toBe(false);
  });

  it('rejects a malformed URL string', () => {
    expect(isValidCheckoutUrl('not-a-url')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidCheckoutUrl('')).toBe(false);
  });
});

describe('Ref schema drift guard', () => {
  const schema = JSON.parse(
    readFileSync(
      fileURLToPath(new URL('../../schemas/well-known/pim-refs-feed.schema.json', import.meta.url)),
      'utf8',
    ),
  );
  const refProps = schema.$defs.Ref.properties;

  it('acceptedPaymentMethods enum matches the PAYMENT_METHODS source of truth', () => {
    // If this fails, the JSON Schema has drifted from src/types.ts — update the
    // schema's enum to match PAYMENT_METHODS (or vice versa). They must agree.
    expect(refProps.acceptedPaymentMethods.items.enum).toEqual([...PAYMENT_METHODS]);
  });

  it('exposes sellerCheckoutUrl (camelCase) and not the legacy snake_case key', () => {
    expect(refProps.sellerCheckoutUrl).toBeDefined();
    expect(refProps.seller_checkout_url).toBeUndefined();
  });

  it('does not constrain sellerCheckoutUrl to a single payment vendor', () => {
    // PIM is vendor-neutral: the schema must not pin checkout to one provider.
    expect(refProps.sellerCheckoutUrl.pattern).toBeUndefined();
    expect(refProps.sellerCheckoutUrl.format).toBe('uri');
  });
});
