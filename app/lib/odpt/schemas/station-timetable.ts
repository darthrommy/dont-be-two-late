import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	maybeArray,
	multiLanguage,
	odptTime,
	owlSameAs,
	xsdDate,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:StationTimetable" satisfies DataName;

const params = z.partial(
	z.object({
		"@id": maybeArray(z.string()),
		"owl:sameAs": maybeArray(owlSameAs),
		"odpt:station": maybeArray(owlSameAs),
		"odpt:operator": maybeArray(owlSameAs),
		"odpt:railDirection": maybeArray(owlSameAs),
		"odpt:calendar": maybeArray(owlSameAs),
		"dc:date": maybeArray(xsdDatetime),
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
	"odpt:railway": owlSameAs,
	"odpt:railwayTitle": z.optional(multiLanguage),
	"odpt:station": z.optional(owlSameAs),
	"odpt:stationTitle": z.optional(multiLanguage),
	"odpt:railDirection": z.optional(owlSameAs),
	"odpt:calendar": z.optional(owlSameAs),
	"odpt:stationTimetableObject": z.array(
		z.partial(
			z.object({
				"odpt:arrivalTime": odptTime,
				"odpt:departureTime": odptTime,
				"odpt:originStation": z.array(owlSameAs),
				"odpt:destinationStation": z.array(owlSameAs),
				"odpt:viaStation": z.array(owlSameAs),
				"odpt:viaRailway": z.array(owlSameAs),
				"odpt:train": owlSameAs,
				"odpt:trainNumber": z.string(),
				"odpt:trainType": owlSameAs,
				"odpt:trainName": z.array(multiLanguage),
				"odpt:trainOwner": owlSameAs,
				"odpt:isLast": z.boolean(),
				"odpt:isOrigin": z.boolean(),
				"odpt:platformNumber": z.string(),
				"odpt:platformName": multiLanguage,
				"odpt:carComposition": z.int(),
				"odpt:note": z.optional(multiLanguage),
			}),
		),
	),
	"odpt:note": z.optional(multiLanguage),
});

export const OdptStationTimetable = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
