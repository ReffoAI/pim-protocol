# PIM Protocol — `/.well-known/` Endpoints

PIM operators expose two machine-readable endpoints under `/.well-known/pim/`:

| Endpoint | Type | Description |
|---|---|---|
| `/.well-known/pim` | `PimDiscoveryDoc` | Discovery document — identifies the operator and lists available feeds |
| `/.well-known/pim/refs.json` | `PimRefsFeed` | Catalog feed — paginated list of active `Ref` objects |

---

## `/.well-known/pim` — Discovery Document

**Recommended headers:**
```
Content-Type: application/json
Cache-Control: public, max-age=3600
Access-Control-Allow-Origin: *
```

**Example response:**
```json
{
  "pim_version": "0.6",
  "operator": {
    "name": "Example Marketplace",
    "url": "https://example.com",
    "support_email": "hello@example.com"
  },
  "capabilities": {
    "refs_feed": "https://example.com/.well-known/pim/refs.json"
  },
  "platform_role": "pairing",
  "processes_payments": false,
  "rate_limits": {
    "anonymous_rps": 5,
    "authenticated_rps": 50
  },
  "terms": "https://example.com/terms",
  "privacy": "https://example.com/privacy"
}
```

**TypeScript type:** `PimDiscoveryDoc` (exported from `@pelagora/pim-protocol`)

**JSON Schema:** `@pelagora/pim-protocol/schemas/well-known/pim-discovery`

### `platform_role`

| Value | Meaning |
|---|---|
| `"pairing"` | Discovery / matching only. Operator does not process payments. |
| `"merchant"` | Direct seller. Operator may process payments. |

Discovery-only / pairing platforms should omit the `capabilities.checkout` field (or set it to `null`) and set `processes_payments: false`.

---

## `/.well-known/pim/refs.json` — Catalog Feed

**Recommended headers:**
```
Content-Type: application/json
Cache-Control: s-maxage=300
Access-Control-Allow-Origin: *
```

**Example response:**
```json
{
  "pim_version": "0.6",
  "refs": [
    {
      "id": "abc123",
      "name": "Vintage Leica M3",
      "description": "1956 Leica M3 double-stroke, light seals replaced, excellent glass.",
      "category": "Cameras & Photo",
      "subcategory": "Film Cameras",
      "listingStatus": "for_sale",
      "quantity": 1,
      "reffoSynced": true,
      "networkPublished": true,
      "beaconId": "0xdeadbeef",
      "createdAt": "2026-05-01T10:00:00Z",
      "updatedAt": "2026-05-10T14:30:00Z"
    }
  ],
  "next_page_url": "https://example.com/.well-known/pim/refs.json?page=2"
}
```

**TypeScript type:** `PimRefsFeed` (exported from `@pelagora/pim-protocol`)

**JSON Schema:** `@pelagora/pim-protocol/schemas/well-known/pim-refs-feed`

### Pagination

Cap each page at a reasonable size (e.g. 1,000 items). Include `next_page_url` when more pages exist. Omit it on the final page.

---

## `sellerCheckoutUrl` on `Ref`

The `Ref` type includes an optional `sellerCheckoutUrl` field. When present, agent surfaces (ACP feeds, Pelagora skills) route buyers directly to the seller's checkout. The PIM operator never sees payment data — this is a pass-through URL owned and controlled by the seller.

PIM is **provider-neutral**: any seller-hosted https checkout endpoint is conformant — Stripe Checkout, a BTCPay/Lightning invoice page, or any other processor. Restricting checkout to a specific payment provider is an operator/product policy and belongs in the consuming application (e.g. a reffo-api allowlist), not in the canonical protocol.

**Constraints:**
- Must be a well-formed URL
- Protocol must be `https`
- Must not embed credentials (no `user:pass@` userinfo)

**Validation:** use `isValidCheckoutUrl(url)` exported from `@pelagora/pim-protocol`.

```ts
import { isValidCheckoutUrl } from '@pelagora/pim-protocol';

isValidCheckoutUrl(undefined);                              // true (optional)
isValidCheckoutUrl('https://buy.stripe.com/abc');           // true
isValidCheckoutUrl('https://checkout.example.com/pay');     // true (any provider)
isValidCheckoutUrl('https://pay.myshop.io/i/invoice123');   // true (BTCPay/Lightning)
isValidCheckoutUrl('http://checkout.example.com/pay');      // false (not https)
isValidCheckoutUrl('https://user:pass@example.com/pay');    // false (embedded credentials)
```

---

## Consuming the endpoints

```ts
import type { PimDiscoveryDoc, PimRefsFeed } from '@pelagora/pim-protocol';

// 1. Discover
const discovery: PimDiscoveryDoc = await fetch('https://example.com/.well-known/pim').then(r => r.json());

// 2. Fetch the catalog
const feed: PimRefsFeed = await fetch(discovery.capabilities.refs_feed).then(r => r.json());

// 3. Work with refs
for (const ref of feed.refs) {
  console.log(ref.name, ref.sellerCheckoutUrl ?? 'contact seller via listing');
}
```

---

## Validating with JSON Schema

```ts
import discoverySchema from '@pelagora/pim-protocol/schemas/well-known/pim-discovery';
import refsFeedSchema from '@pelagora/pim-protocol/schemas/well-known/pim-refs-feed';
// Use with your preferred JSON Schema validator (e.g. ajv)
```
