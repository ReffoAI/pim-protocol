# Changelog

All notable changes to **@pelagora/pim-protocol** will be documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

## [0.5.0] — 2026-04-08

### Added
- `sold_out` listing status and `StockType` type (`tracked` | `unlimited`)
- `negotiable` boolean flag on `Ref`

## [Unreleased]

Nothing yet.

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
