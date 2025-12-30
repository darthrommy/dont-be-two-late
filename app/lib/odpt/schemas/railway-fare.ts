import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	maybeArray,
	owlSameAs,
	xsdDate,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:RailwayFare" satisfies DataName;

const params = z.partial(
	z.object({
		"@id": maybeArray(z.string()),
		"owl:sameAs": maybeArray(owlSameAs),
		"odpt:operator": maybeArray(owlSameAs),
		"odpt:fromStation": maybeArray(owlSameAs),
		"odpt:toStation": maybeArray(owlSameAs),
	}),
);

const data = z.object({
	"@context": atContext,
	"@id": z.string(),
	"@type": z.literal(dataname),
	"owl:sameAs": owlSameAs,
	"dc:date": xsdDatetime,
	"dct:issued": z.optional(xsdDate),
	"dct:valid": z.optional(xsdDatetime),
	"odpt:operator": owlSameAs,
	"odpt:fromStation": owlSameAs,
	"odpt:toStation": owlSameAs,
	"odpt:ticketFare": z.int(),
	"odpt:icCardFare": z.optional(z.int()),
	"odpt:childTicketFare": z.optional(z.int()),
	"odpt:childIcCardFare": z.optional(z.int()),
	"odpt:viaStation": z.optional(z.array(owlSameAs)),
	"odpt:viaRailway": z.optional(z.array(owlSameAs)),
	"odpt:ticketType": z.optional(z.string()),
	"odpt:paymentMethod": z.optional(z.array(z.string())),
});

export const OdptRailwayFare = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
