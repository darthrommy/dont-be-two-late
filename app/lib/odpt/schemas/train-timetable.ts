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

const dataname = "odpt:TrainTimetable" satisfies DataName;

const params = z.partial(
	z.object({
		"@id": maybeArray(z.string()),
		"owl:sameAs": maybeArray(owlSameAs),
		"odpt:trainNumber": maybeArray(z.string()),
		"odpt:railway": maybeArray(owlSameAs),
		"odpt:operator": maybeArray(owlSameAs),
		"odpt:trainType": maybeArray(owlSameAs),
		"odpt:train": maybeArray(owlSameAs),
		"odpt:calendar": maybeArray(owlSameAs),
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
	"odpt:railDirection": z.optional(owlSameAs),
	"odpt:calendar": z.optional(owlSameAs),
	"odpt:train": z.optional(owlSameAs),
	"odpt:trainNumber": z.string(),
	"odpt:trainType": z.optional(owlSameAs),
	"odpt:trainName": z.optional(z.array(multiLanguage)),
	"odpt:trainOwner": z.optional(owlSameAs),
	"odpt:originStation": z.optional(z.array(owlSameAs)),
	"odpt:destinationStation": z.optional(z.array(owlSameAs)),
	"odpt:viaStation": z.optional(z.array(owlSameAs)),
	"odpt:viaRailway": z.optional(z.array(owlSameAs)),
	"odpt:previousTrainTimetable": z.optional(z.array(owlSameAs)),
	"odpt:nextTrainTimetable": z.optional(z.array(owlSameAs)),
	"odpt:trainTimetableObject": z.array(
		z.partial(
			z.object({
				"odpt:arrivalTime": odptTime,
				"odpt:arrivalStation": owlSameAs,
				"odpt:departureTime": odptTime,
				"odpt:departureStation": owlSameAs,
				"odpt:platformNumber": z.string(),
				"odpt:platformName": multiLanguage,
				"odpt:note": multiLanguage,
			}),
		),
	),
	"odpt:needExtraFee": z.optional(z.boolean()),
	"odpt:note": z.optional(multiLanguage),
});

export const OdptTrainTimetable = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
