import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	multiLanguage,
	owlSameAs,
	ugRegion,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:Station" satisfies DataName;

const params = z.partial(
	z.object({
		"@id": z.string(),
		"owl:sameAs": owlSameAs,
		"dc:title": z.string(),
		"odpt:operator": owlSameAs,
		"odpt:railway": owlSameAs,
		"odpt:stationCode": z.string(),
	}),
);

const data = z.object({
	"@context": atContext,
	"@id": z.string(),
	"@type": z.literal(dataname),
	"owl:sameAs": owlSameAs,
	"dc:date": xsdDatetime,
	"dc:title": z.optional(z.string()),
	"odpt:stationTitle": z.optional(multiLanguage),
	"odpt:operator": owlSameAs,
	"odpt:railway": owlSameAs,
	"odpt:stationCode": z.optional(z.string()),
	"geo:long": z.optional(z.number()),
	"geo:lat": z.optional(z.number()),
	"ug:region": z.optional(ugRegion),
	"odpt:exit": z.optional(z.array(z.string())),
	"odpt:connectingRailway": z.optional(z.array(owlSameAs)),
	"odpt:connectingStation": z.optional(z.array(owlSameAs)),
	"odpt:stationTimetable": z.optional(z.array(owlSameAs)),
	"odpt:passengerSurvey": z.optional(z.array(owlSameAs)),
});

export const OdptStation = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
