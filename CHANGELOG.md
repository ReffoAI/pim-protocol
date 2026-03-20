# Changelog

All notable changes to **@reffo/protocol** will be documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
