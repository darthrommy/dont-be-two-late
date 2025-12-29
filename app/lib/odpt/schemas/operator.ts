import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	multiLanguage,
	owlSameAs,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:Operator" satisfies DataName;

const operatorParams = z.partial(
	z.object({
		"@id": z.string().check(z.minLength(1)),
		"owl:sameAs": owlSameAs,
	}),
);

const odptOperator = z.object({
	"@context": atContext,
	"@id": z.string().check(z.minLength(1)),
	"@type": z.literal(dataname),
	"dc:date": xsdDatetime,
	"owl:sameAs": owlSameAs,
	"dc:title": z.string(),
	"odpt:operatorTitle": z.optional(multiLanguage),
});

export const OdptOperator = {
	name: dataname,
	params: operatorParams,
	data: odptOperator,
} as const satisfies EndpointConfig;
