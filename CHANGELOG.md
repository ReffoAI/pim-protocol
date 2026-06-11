# Changelog

All notable changes to **@pelagora/pim-protocol** will be documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

## [0.5.0] — 2026-04-08

### Added
- `sold_out` listing status and `StockType` type (`tracked` | `unlimited`)
- `negotiable` boolean flag on `Ref`

## [Unreleased]

Nothing yet.

## [0.7.0] — 2026-06-11

### Added

- `LocationVisibility` type (`'approximate' | 'exact'`) — privacy discriminator for location fields. **Default semantics: absent = `'approximate'`** (existing listings are unaffected — they stay private). `'exact'` opts a listing into public address disclosure (e.g. a garage sale). Consumers (Pelagora, etc.) must enforce this: blur coordinates and omit `locationAddress` unless this field is explicitly `'exact'`.
- `EventType` open-vocabulary type and `RECOMMENDED_EVENT_TYPES` advisory constant (`garage_sale`, `estate_sale`, `flea_market`, `pop_up`, `ticketed_event`). Open string — novel event kinds are never gated and require no protocol bump.
- Seven optional fields on `Ref` (all additive, no `required` changes, no breakage):
  - `locationVisibility?: LocationVisibility`
  - `startDate?: string` (ISO 8601 — event occurrence start)
  - `endDate?: string` (ISO 8601 — event occurrence end)
  - `timeZone?: string` (IANA name, e.g. `America/New_York`)
  - `validFrom?: string` (ISO 8601 — Schema.org `Offer.availabilityStarts`)
  - `validThrough?: string` (ISO 8601 — Schema.org `Offer.availabilityThrough`)
  - `eventType?: EventType` (open vocabulary)
- `LocationVisibility`, `EventType`, and `RECOMMENDED_EVENT_TYPES` exported from the package entrypoint.
- JSON Schema updated: `locationVisibility` is a closed `enum` (correct — it is a privacy discriminator, not a vocabulary); `eventType` is an open string with `examples` (vendor-neutral vocab pattern); date fields carry `format: "date-time"`.
- `buildSchemaOrgLD`: when `validFrom`/`validThrough` are present, emits `offer.availabilityStarts`/`availabilityEnds`; when `startDate` + `eventType` are present, emits a `reffo:event` node (Schema.org `Event`) — exact street address included only when `locationVisibility === 'exact'`.
- Drift-guard tests for all new schema surface: `locationVisibility` has closed `enum`; `eventType` has no `enum` and `examples` match `RECOMMENDED_EVENT_TYPES`; date fields have `format: "date-time"`; none of the seven fields appear in `required`.

### Notes

- **Privacy default preserved:** absent `locationVisibility` MUST mean approximate; consumers must never expose `locationAddress` or precise coordinates unless the field is explicitly `'exact'`.
- **Protocol stays declarative:** no `expired` `ListingStatus` added; no auto-mutation on `endDate`. Consumers derive expiry at render time from `endDate`/`validThrough`.
- **Reserved future seams:** `recurrenceRule` (recurring events) and a first-class `PimEvent` entity are reserved by name — not in 0.7.0, names reserved to avoid a later rename.
- **Consumer follow-on required (ticket 0022):** this protocol change is inert until the Pelagora consumer learns to honor `locationVisibility: 'exact'` and render the address publicly.
- **Human publish steps:** merge the PR → `npm publish` → tag `v0.7.0` in GitHub. The EDM cannot publish.

## [0.6.0] — 2026-05-25

### Added
- `/.well-known/pim` and `/.well-known/pim/refs.json` endpoint conventions documented in `docs/well-known.md`
- `PimDiscoveryDoc` and `PimRefsFeed` TypeScript types exported from the package entrypoint
- `PimOperator`, `PimRateLimits`, `PimCapabilities` helper types
- `isValidCheckoutUrl()` validation function — provider-neutral: asserts a well-formed https URL with no embedded credentials. Does NOT restrict checkout to any single payment provider; provider allowlisting is left to the consuming application.
- JSON Schema files for both well-known shapes under `schemas/well-known/`
- `schemas/` directory included in npm package; schemas accessible via package exports
- Optional `sellerCheckoutUrl` field on `Ref` — seller-hosted checkout URL. Provider-neutral (Stripe, BTCPay/Lightning, or any https processor). "When present, agent surfaces route buyers directly to the seller's checkout. The PIM operator never sees payment data."
- `acceptedPaymentMethods` is an **open vocabulary**: `PaymentMethod` and the JSON Schema both accept any string, so novel/regional/branded methods are never gated. `RECOMMENDED_PAYMENT_METHODS` exports an advisory set of generic rails (`cash`, `check`, `bank_transfer`, `card`, `bitcoin`, `lightning`) for interop; a drift-guard test keeps the schema's recommended `examples` in sync. Proprietary brand identifiers were removed from the canonical surface.
- No breaking changes — all additions are purely additive. Existing 0.5.x consumers that do not set `sellerCheckoutUrl` continue to work without modification.

## [0.4.0] - 2026-04-03

### Added
- `isValidEmail()` for basic email format validation
- `validateCoordinates()` for lat/lng bounds checking ([-90,90] / [-180,180])
- `SanitizeMode` type (`'truncate' | 'reject'`) for `sanitizeField` and `sanitizeObject`; default remains `'truncate'` for backward compatibility
- `SanitizationError` thrown in `'reject'` mode for use at HTTP API boundaries
- Missing `FIELD_CONSTRAINTS` entries: `content`, `category`, `subcategory`, `condition`, `topic`, `subject`, `currency`

## [0.3.0] - 2026-03-27

### Added
- `archivedAt` field to `Negotiation` interface
- Overhaul category schemas: 32 schemas covering 97 subcategories, export `getAttributeKeys`
- Formal protocol name to README and normalized references

### Changed
- Rename package to `@pelagora/pim-protocol` (updated package name and repository URL)

## [0.2.1] - 2026-03-04

### Added
- Input sanitization utilities for all trust boundaries
- `Skill` plugin interface and widened `PeerMessage` type for skill extensions

## [0.2.0] - 2026-03-01

### Added
- `for_rent` listing status and rental fields (`rentalTerms`, `rentalDeposit`, `rentalDuration`, `rentalDurationUnit`)
- `profilePicturePath` to `BeaconSettings` interface

## [0.1.0] - 2026-02-18

Initial release.

### Added
- Shared TypeScript type system for beacons and the webapp
- `RefItem` interface with Schema.org-aligned fields
- `ListingStatus` type: private, for_sale, willing_to_sell, archived_sold, archived_deleted
- Category taxonomy with schemas and subcategories
- Schema.org JSON-LD builder utilities
- `BeaconSettings`, `Offer`, `Negotiation` interfaces
- CC0-1.0 license (public domain)
