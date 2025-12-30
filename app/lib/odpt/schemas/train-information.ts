import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	maybeArray,
	multiLanguage,
	owlSameAs,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:TrainInformation" satisfies DataName;

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
	"odpt:timeOfOrigin": xsdDatetime,
	"odpt:operator": owlSameAs,
	"odpt:railway": z.optional(owlSameAs),
	"odpt:trainInformationStatus": z.optional(multiLanguage),
	"odpt:trainInformationText": multiLanguage,
	"odpt:railDirection": z.optional(owlSameAs),
	"odpt:trainInformationArea": z.optional(multiLanguage),
	"odpt:trainInformationKind": z.optional(multiLanguage),
	"odpt:stationFrom": z.optional(owlSameAs),
	"odpt:stationTo": z.optional(owlSameAs),
	"odpt:trainInformationRange": z.optional(multiLanguage),
	"odpt:trainInformationCause": z.optional(multiLanguage),
	"odpt:transferRailways": z.optional(z.array(owlSameAs)),
	"odpt:resumeEstimate": z.optional(xsdDatetime),
});

export const OdptTrainInformation = {
	name: dataname,
	params: params,
	data: data,
} as const satisfies EndpointConfig;
