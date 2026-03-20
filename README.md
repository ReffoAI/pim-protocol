# @reffo/protocol

**Personal Inventory Management Protocol**

Shared definitions for the protocol. Contains Schema.org-aligned types, category schemas, and utility functions used by Pelagora, Reffo Webapp, and other implementations.

## Install

```bash
npm install @reffo/protocol
```

## Usage

```typescript
import {
  type Ref,
  type Offer,
  getCategorySchema,
  buildSchemaOrgLD,
  blurLocation,
  haversineDistanceMiles,
} from '@reffo/protocol';
```

## What's Included

### Types (`types.ts`)

Core data model types aligned with Schema.org:

- **Ref** — A product/item listing (Schema.org `Product`)
- **Offer** — A price offering on a ref (Schema.org `Offer`)
- **Negotiation** — Buyer/seller negotiation state
- **BeaconSettings / BeaconInfo** — Beacon node configuration and status
- **RefMedia** — Photo/video attachments
- **DHT Payloads** — `PeerMessage`, `QueryPayload`, `AnnouncePayload`, `ProposalPayload`, `ProposalResponsePayload`

Utility functions:

- `blurLocation(lat, lng)` — Reduce precision to ~0.7 mi / zip-code level
- `haversineDistanceMiles(lat1, lng1, lat2, lng2)` — Great-circle distance

### Schemas (`schemas.ts`)

Category-specific attribute definitions with Schema.org JSON-LD generation:

- **8 category schemas**: Car, Boat, Housing, Phone, Furniture, Art, Dining Service, Default
- `getCategorySchema(category, subcategory)` — Look up schema by category
- `buildSchemaOrgLD(category, subcategory, attrs, baseFields)` — Generate Schema.org JSON-LD
- `CATEGORY_SCHEMAS` — The full registry map
- `AttributeField` / `CategorySchema` — Schema definition interfaces

## Build

```bash
npm install
npm run build    # Outputs ESM + CJS to dist/
npm run lint     # Type-check only
```

## License

CC0-1.0 — See [LICENSE](./LICENSE)
