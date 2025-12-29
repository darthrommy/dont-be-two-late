import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import { atContext, owlSameAs, xsdDatetime } from "./base-schemas";

const dataname = "odpt:PassengerSurvey" satisfies DataName;

const params = z.partial(
	z.object({
		"@id": z.string(),
		"owl:sameAs": owlSameAs,
		"odpt:operator": owlSameAs,
		"odpt:station": owlSameAs,
		"odpt:railway": owlSameAs,
	}),
);

const data = z.object({
	"@context": atContext,
	"@id": z.string(),
	"@type": z.literal(dataname),
	"owl:sameAs": owlSameAs,
	"dc:date": xsdDatetime,
	"odpt:operator": owlSameAs,
	"odpt:station": z.array(owlSameAs),
	"odpt:railway": z.array(owlSameAs),
	"odpt:includeAlighting": z.boolean(),
	"odpt:passengerSurveyObject": z.array(
		z.object({
			"odpt:surveyYear": z.int(),
			"odpt:passengerJourneys": z.int(),
		}),
	),
});

export const OdptPassengerSurvey = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
