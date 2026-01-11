import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	maybeArray,
	multiLanguage,
	owlSameAs,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:Operator" satisfies DataName;

const params = z.partial(
	z.object({
		"@id": maybeArray(z.string()),
		"owl:sameAs": maybeArray(owlSameAs),
	}),
);

const data = z.object({
	"@context": atContext,
	"@id": z.string(),
	"@type": z.literal(dataname),
	"dc:date": z.optional(xsdDatetime),
	"owl:sameAs": owlSameAs,
	"dc:title": z.optional(z.string()),
	"odpt:operatorTitle": z.optional(multiLanguage),
});

export const OdptOperator = {
	name: dataname,
	params,
	data,
} as const satisfies EndpointConfig;
