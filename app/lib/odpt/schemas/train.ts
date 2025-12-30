import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	maybeArray,
	multiLanguage,
	owlSameAs,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:Train" satisfies DataName;

const params = z.partial(
	z.object({
		"@id": maybeArray(z.string()),
		"owl:sameAs": maybeArray(owlSameAs),
		"odpt:operator": maybeArray(owlSameAs),
		"odpt:railway": maybeArray(owlSameAs),
	}),
);

const data = z.object({
	"@context": atContext,
	"@id": z.string(),
	"@type": z.literal(dataname),
	"owl:sameAs": owlSameAs,
	"dc:date": xsdDatetime,
	"dct:valid": z.optional(xsdDatetime),
	"odpt:operator": owlSameAs,
	"odpt:railway": owlSameAs,
	"odpt:railDirection": z.optional(owlSameAs),
	"odpt:trainNumber": z.string(),
	"odpt:trainType": z.optional(owlSameAs),
	"odpt:trainName": z.optional(z.array(multiLanguage)),
	"odpt:fromStation": z.optional(owlSameAs),
	"odpt:toStation": z.optional(owlSameAs),
	"odpt:originStation": z.optional(z.array(owlSameAs)),
	"odpt:destinationStation": z.optional(z.array(owlSameAs)),
	"odpt:viaStation": z.optional(z.array(owlSameAs)),
	"odpt:viaRailway": z.optional(z.array(owlSameAs)),
	"odpt:trainOwner": z.optional(z.string()),
	"odpt:index": z.optional(z.int()),
	"odpt:delay": z.optional(z.number()),
	"odpt:carComposition": z.optional(z.int()),
	"odpt:note": z.optional(multiLanguage),
});

export const OdptTrain = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
