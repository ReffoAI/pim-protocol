/**
 * Input sanitization utilities for the protocol.
 *
 * Every free-text field that crosses a trust boundary (HTTP, DHT, MCP)
 * should be run through sanitizeField / sanitizeObject before storage.
 */

import type { PeerMessage } from './types.js';

// ── Field constraints ────────────────────────────────────────────────

export interface FieldConstraint {
  maxLength: number;
  stripHtml: boolean;
  trim: boolean;
}

export const FIELD_CONSTRAINTS: Record<string, FieldConstraint> = {
  name:              { maxLength: 200,  stripHtml: true,  trim: true },
  refName:           { maxLength: 200,  stripHtml: true,  trim: true },
  wantName:          { maxLength: 200,  stripHtml: true,  trim: true },
  description:       { maxLength: 5000, stripHtml: true,  trim: true },
  message:           { maxLength: 2000, stripHtml: true,  trim: true },
  content:           { maxLength: 2000, stripHtml: true,  trim: true },
  responseMessage:   { maxLength: 2000, stripHtml: true,  trim: true },
  rentalTerms:       { maxLength: 2000, stripHtml: true,  trim: true },
  sku:               { maxLength: 100,  stripHtml: true,  trim: true },
  category:          { maxLength: 100,  stripHtml: true,  trim: true },
  subcategory:       { maxLength: 100,  stripHtml: true,  trim: true },
  condition:         { maxLength: 50,   stripHtml: true,  trim: true },
  topic:             { maxLength: 100,  stripHtml: true,  trim: true },
  subject:           { maxLength: 200,  stripHtml: true,  trim: true },
  locationCity:      { maxLength: 100,  stripHtml: true,  trim: true },
  locationState:     { maxLength: 100,  stripHtml: true,  trim: true },
  locationZip:       { maxLength: 20,   stripHtml: true,  trim: true },
  locationCountry:   { maxLength: 10,   stripHtml: false, trim: true },
  priceCurrency:     { maxLength: 10,   stripHtml: false, trim: true },
  currency:          { maxLength: 10,   stripHtml: false, trim: true },
  email:             { maxLength: 254,  stripHtml: true,  trim: true },
  search:            { maxLength: 200,  stripHtml: true,  trim: true },
  searchQuery:       { maxLength: 500,  stripHtml: true,  trim: true },
  url:               { maxLength: 2000, stripHtml: false, trim: true },
  locationAddress:   { maxLength: 500,  stripHtml: true,  trim: true },
  location:          { maxLength: 500,  stripHtml: true,  trim: true },
};

// ── Sanitization modes ──────────────────────────────────────────────

/**
 * Controls how sanitizeField handles constraint violations.
 * - 'truncate': silently slice to maxLength (default, backward-compatible).
 *               Use for DHT messages or contexts where you cannot return an error.
 * - 'reject':   throw a SanitizationError if any constraint is exceeded.
 *               Use at HTTP API boundaries where you can return a 400.
 */
export type SanitizeMode = 'truncate' | 'reject';

export class SanitizationError extends Error {
  public readonly field: string;
  public readonly constraint: string;

  constructor(field: string, constraint: string, message: string) {
    super(message);
    this.name = 'SanitizationError';
    this.field = field;
    this.constraint = constraint;
  }
}

// ── Core helpers ─────────────────────────────────────────────────────

/** Remove all HTML tags from a string. */
export function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize a single field value by name.
 *
 * In 'truncate' mode (default), oversized strings are silently sliced.
 * In 'reject' mode, a SanitizationError is thrown if maxLength is exceeded.
 */
export function sanitizeField(
  value: string,
  fieldName: string,
  mode: SanitizeMode = 'truncate',
): string {
  const constraint = FIELD_CONSTRAINTS[fieldName];
  if (!constraint) return value;

  let result = value;
  if (constraint.trim) result = result.trim();
  if (constraint.stripHtml) result = stripHtml(result);

  if (result.length > constraint.maxLength) {
    if (mode === 'reject') {
      throw new SanitizationError(
        fieldName,
        'maxLength',
        `Field "${fieldName}" exceeds maximum length of ${constraint.maxLength} characters (received ${result.length})`,
      );
    }
    result = result.slice(0, constraint.maxLength);
  }
  return result;
}

/**
 * Sanitize all string fields of an object that have known constraints.
 * Non-string values and unknown field names pass through unchanged.
 * Returns a shallow copy with cleaned strings.
 *
 * In 'truncate' mode (default), oversized strings are silently sliced.
 * In 'reject' mode, a SanitizationError is thrown on the first violation.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  mode: SanitizeMode = 'truncate',
): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string' && FIELD_CONSTRAINTS[key]) {
      (result as Record<string, unknown>)[key] = sanitizeField(
        result[key] as string,
        key,
        mode,
      );
    }
  }
  return result;
}

// ── Email validation ────────────────────────────────────────────────

/**
 * Basic email format validation.
 * Checks for: non-empty local part, @ symbol, non-empty domain with a dot.
 * This is intentionally simple — full RFC 5322 compliance is not the goal.
 * The goal is to reject obvious garbage (missing @, no domain, etc.).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

// ── Coordinate validation ───────────────────────────────────────────

export interface CoordinateValidationResult {
  valid: boolean;
  lat: number;
  lng: number;
  error?: string;
}

/**
 * Validate latitude and longitude values.
 * Latitude must be in [-90, 90], longitude must be in [-180, 180].
 * Returns a result object with the parsed values and validity status.
 */
export function validateCoordinates(
  lat: unknown,
  lng: unknown,
): CoordinateValidationResult {
  const latNum = typeof lat === 'number' ? lat : Number(lat);
  const lngNum = typeof lng === 'number' ? lng : Number(lng);

  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return {
      valid: false,
      lat: latNum,
      lng: lngNum,
      error: 'Latitude and longitude must be valid numbers',
    };
  }

  if (latNum < -90 || latNum > 90) {
    return {
      valid: false,
      lat: latNum,
      lng: lngNum,
      error: `Latitude must be between -90 and 90 (received ${latNum})`,
    };
  }

  if (lngNum < -180 || lngNum > 180) {
    return {
      valid: false,
      lat: latNum,
      lng: lngNum,
      error: `Longitude must be between -180 and 180 (received ${lngNum})`,
    };
  }

  return { valid: true, lat: latNum, lng: lngNum };
}

// ── Prompt injection defense ─────────────────────────────────────────

/** Wrap user text in delimiters to prevent prompt injection. */
export function delimitUserText(text: string, label: string): string {
  const tag = label.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  return `===BEGIN_${tag}===\n${text}\n===END_${tag}===`;
}

// ── DHT message validation ───────────────────────────────────────────

const MAX_DHT_MESSAGE_SIZE = 64 * 1024; // 64 KB

/**
 * Parse and validate a raw DHT message buffer.
 * Returns null for oversized, malformed, or missing-field messages.
 */
export function parseDhtMessage(raw: Buffer | string): PeerMessage | null {
  const str = typeof raw === 'string' ? raw : raw.toString('utf-8');

  if (str.length > MAX_DHT_MESSAGE_SIZE) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(str);
  } catch {
    return null;
  }

  if (
    typeof parsed !== 'object' || parsed === null ||
    typeof (parsed as Record<string, unknown>).type !== 'string' ||
    typeof (parsed as Record<string, unknown>).beaconId !== 'string'
  ) {
    return null;
  }

  return parsed as PeerMessage;
}
