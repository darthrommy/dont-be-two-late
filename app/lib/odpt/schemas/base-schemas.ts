import { z } from "zod/mini";

/**
 * Validation for `@context` field.
 */
export const atContext = z.string();
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
export const multiLanguage = z.partial(
	z.looseObject({
		ja: z.string(),
		en: z.string(),
	}),
);
/**
 * Validation for `ug:region`
 */
export const ugRegion = z.record(z.string(), z.unknown());
/**
 * Validation for `odpt:Time` field.
 */
export const odptTime = z.iso.time({ precision: -1 });
/**
 * Utility to validate a field that can be either a single object or an array of objects.
 * @param schema The Zod schema for the individual item.
 * @returns A Zod schema that validates either a single item or an array of items.
 */
export const maybeArray = <T extends z.ZodMiniType>(schema: T) =>
	z.union([schema, z.array(schema)]);
