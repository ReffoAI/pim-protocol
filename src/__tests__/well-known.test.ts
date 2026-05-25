import { describe, it, expect } from 'vitest';
import { isValidSellerCheckoutUrl } from '../well-known.js';

describe('isValidSellerCheckoutUrl', () => {
  it('accepts undefined (field is optional)', () => {
    expect(isValidSellerCheckoutUrl(undefined)).toBe(true);
  });

  it('accepts a valid https://buy.stripe.com/ URL', () => {
    expect(isValidSellerCheckoutUrl('https://buy.stripe.com/test_abc123')).toBe(true);
  });

  it('accepts a valid https://checkout.stripe.com/ URL', () => {
    expect(isValidSellerCheckoutUrl('https://checkout.stripe.com/pay/cs_test_abc')).toBe(true);
  });

  it('accepts https://stripe.com/ directly', () => {
    expect(isValidSellerCheckoutUrl('https://stripe.com/')).toBe(true);
  });

  it('rejects http:// (not https)', () => {
    expect(isValidSellerCheckoutUrl('http://stripe.com/pay')).toBe(false);
  });

  it('rejects https://example.com/ (not stripe.com)', () => {
    expect(isValidSellerCheckoutUrl('https://example.com/pay')).toBe(false);
  });

  it('rejects a non-Stripe https URL', () => {
    expect(isValidSellerCheckoutUrl('https://evil.com/stripe.com/pay')).toBe(false);
  });

  it('rejects a malformed URL string', () => {
    expect(isValidSellerCheckoutUrl('not-a-url')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidSellerCheckoutUrl('')).toBe(false);
  });
});
