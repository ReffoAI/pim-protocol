/**
 * Input sanitization utilities for the Reffo protocol.
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
  responseMessage:   { maxLength: 2000, stripHtml: true,  trim: true },
  rentalTerms:       { maxLength: 2000, stripHtml: true,  trim: true },
  sku:               { maxLength: 100,  stripHtml: true,  trim: true },
  locationCity:      { maxLength: 100,  stripHtml: true,  trim: true },
  locationState:     { maxLength: 100,  stripHtml: true,  trim: true },
  locationZip:       { maxLength: 20,   stripHtml: true,  trim: true },
  locationCountry:   { maxLength: 10,   stripHtml: false, trim: true },
  priceCurrency:     { maxLength: 10,   stripHtml: false, trim: true },
  email:             { maxLength: 254,  stripHtml: true,  trim: true },
  search:            { maxLength: 200,  stripHtml: true,  trim: true },
  searchQuery:       { maxLength: 500,  stripHtml: true,  trim: true },
  url:               { maxLength: 2000, stripHtml: false, trim: true },
  locationAddress:   { maxLength: 500,  stripHtml: true,  trim: true },
  location:          { maxLength: 500,  stripHtml: true,  trim: true },
};

// ── Core helpers ─────────────────────────────────────────────────────

/** Remove all HTML tags from a string. */
export function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

/** Sanitize a single field value by name. */
export function sanitizeField(value: string, fieldName: string): string {
  const constraint = FIELD_CONSTRAINTS[fieldName];
  if (!constraint) return value;

  let result = value;
  if (constraint.trim) result = result.trim();
  if (constraint.stripHtml) result = stripHtml(result);
  if (result.length > constraint.maxLength) {
    result = result.slice(0, constraint.maxLength);
  }
  return result;
}

/**
 * Sanitize all string fields of an object that have known constraints.
 * Non-string values and unknown field names pass through unchanged.
 * Returns a shallow copy with cleaned strings.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string' && FIELD_CONSTRAINTS[key]) {
      (result as Record<string, unknown>)[key] = sanitizeField(result[key] as string, key);
    }
  }
  return result;
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
