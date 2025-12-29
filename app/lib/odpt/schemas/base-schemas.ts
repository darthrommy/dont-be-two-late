import { z } from "zod/mini";

/**
 * Validation for `@context` field.
 */
export const atContext = z.literal("http://vocab.odpt.org/context_odpt.jsonld");
/**
 * Validation for `owl:sameAs` or other params pointing at this field.
 */
export const owlSameAs = z.url({ protocol: /^odpt\.[A-Za-z]+$/ });
/**
 * Validation for `xsd:date` type field
 */
export const xsdDate = z.iso.date();
/**
 * Validation for `xsd:datetime` type field
 */
export const xsdDatetime = z.iso.datetime({ offset: true });
/**
 * Validation for language object.
 */
export const multiLanguage = z.looseRecord(z.enum(["ja", "en"]), z.string());
/**
 * Validation for `ug:region`
 */
export const ugRegion = z.record(z.string(), z.unknown());
/**
 * Validation for `odpt:Time` field.
 */
export const odptTime = z.iso.time({ precision: -1 });
