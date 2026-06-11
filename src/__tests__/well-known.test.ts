import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isValidCheckoutUrl } from '../well-known.js';
import { RECOMMENDED_PAYMENT_METHODS, RECOMMENDED_EVENT_TYPES } from '../types.js';

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

  it('keeps acceptedPaymentMethods OPEN — no hard enum (any string is valid)', () => {
    // PIM is vendor-neutral: payment methods are an open vocabulary, so the
    // schema must NOT pin items to a closed enum. Novel/regional/branded methods
    // must pass without a protocol bump.
    expect(refProps.acceptedPaymentMethods.items.enum).toBeUndefined();
    expect(refProps.acceptedPaymentMethods.items.type).toBe('string');
  });

  it('schema examples stay in sync with RECOMMENDED_PAYMENT_METHODS', () => {
    // The recommended vocabulary is advisory (examples), not a constraint. If this
    // fails, update the schema's examples to match src/types.ts (or vice versa).
    expect(refProps.acceptedPaymentMethods.items.examples).toEqual([...RECOMMENDED_PAYMENT_METHODS]);
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

describe('Ref schema drift guard — v0.7 location-visibility + event fields', () => {
  const schema = JSON.parse(
    readFileSync(
      fileURLToPath(new URL('../../schemas/well-known/pim-refs-feed.schema.json', import.meta.url)),
      'utf8',
    ),
  );
  const refProps = schema.$defs.Ref.properties;

  it('locationVisibility is a CLOSED enum (binary privacy discriminator)', () => {
    expect(refProps.locationVisibility).toBeDefined();
    expect(refProps.locationVisibility.type).toBe('string');
    expect(refProps.locationVisibility.enum).toEqual(['approximate', 'exact']);
  });

  it('eventType is OPEN — no enum, has examples matching RECOMMENDED_EVENT_TYPES', () => {
    expect(refProps.eventType).toBeDefined();
    expect(refProps.eventType.enum).toBeUndefined();
    expect(refProps.eventType.type).toBe('string');
    expect(refProps.eventType.examples).toEqual([...RECOMMENDED_EVENT_TYPES]);
  });

  it('date fields exist with format: date-time', () => {
    for (const field of ['startDate', 'endDate', 'validFrom', 'validThrough']) {
      expect(refProps[field]).toBeDefined();
      expect(refProps[field].type).toBe('string');
      expect(refProps[field].format).toBe('date-time');
    }
  });

  it('timeZone field exists as an open string (no format constraint)', () => {
    expect(refProps.timeZone).toBeDefined();
    expect(refProps.timeZone.type).toBe('string');
    expect(refProps.timeZone.format).toBeUndefined();
  });

  it('none of the v0.7 fields are in the required array (all optional)', () => {
    const required: string[] = schema.$defs.Ref.required ?? [];
    const newFields = ['locationVisibility', 'startDate', 'endDate', 'timeZone', 'validFrom', 'validThrough', 'eventType'];
    for (const field of newFields) {
      expect(required).not.toContain(field);
    }
  });
});
