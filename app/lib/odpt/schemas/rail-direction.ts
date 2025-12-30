import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	maybeArray,
	multiLanguage,
	owlSameAs,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:RailDirection" satisfies DataName;

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
	"owl:sameAs": atContext,
	"dc:date": z.optional(xsdDatetime),
	"dc:title": z.optional(z.string()),
	"odpt:railDirectionTitle": z.optional(multiLanguage),
});

export const OdptRailDirection = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
