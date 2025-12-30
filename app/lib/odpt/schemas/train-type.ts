import { string, z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	maybeArray,
	multiLanguage,
	owlSameAs,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:TrainType" satisfies DataName;

const params = z.partial(
	z.object({
		"@id": maybeArray(z.string()),
		"owl:sameAs": maybeArray(owlSameAs),
		"odpt:operator": maybeArray(owlSameAs),
	}),
);

const data = z.object({
	"@context": atContext,
	"@id": string(),
	"@type": z.literal(dataname),
	"owl:sameAs": owlSameAs,
	"dc:date": z.optional(xsdDatetime),
	"odpt:operator": owlSameAs,
	"dc:title": z.optional(z.string()),
	"odpt:trainTypeTitle": z.optional(multiLanguage),
});

export const OdptTrainType = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
