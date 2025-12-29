import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	multiLanguage,
	owlSameAs,
	ugRegion,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:Railway" satisfies DataName;

const params = z.partial(
	z.object({
		"@id": z.string(),
		"owl:sameAs": owlSameAs,
		"dc:title": z.string(),
		"odpt:operator": owlSameAs,
		"odpt:lineCode": z.string(),
	}),
);

const data = z.object({
	"@context": atContext,
	"@id": z.string(),
	"@type": z.literal(dataname),
	"owl:sameAs": owlSameAs,
	"dc:date": xsdDatetime,
	"dc:title": z.string(),
	"odpt:railwayTitle": z.optional(multiLanguage),
	"odpt:kana": z.optional(z.string()),
	"odpt:operator": owlSameAs,
	"odpt:lineCode": z.optional(z.string()),
	"odpt:color": z.optional(z.string()),
	"ug:region": z.optional(ugRegion),
	"odpt:ascendingRailDirection": z.optional(owlSameAs),
	"odpt:descendingRailDirection": z.optional(owlSameAs),
	"odpt:stationOrder": z.array(
		z.object({
			"odpt:station": owlSameAs,
			"odpt:stationTitle": z.optional(multiLanguage),
			"odpt:index": z.int(),
		}),
	),
});

export const OdptRailway = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
