import { z } from "zod/mini";
import type { DataName, EndpointConfig } from "../type-utils";
import {
	atContext,
	multiLanguage,
	owlSameAs,
	xsdDate,
	xsdDatetime,
} from "./base-schemas";

const dataname = "odpt:Calendar" satisfies DataName;

const calendarParams = z.partial(
	z.object({
		"@id": z.string(),
		"owl:sameAs": owlSameAs,
	}),
);

const odptCalendar = z.object({
	"@context": atContext,
	"@id": z.string(),
	"@type": z.literal(dataname),
	"dc:date": xsdDatetime,
	"owl:sameAs": owlSameAs,
	"dc:title": z.optional(z.string()),
	"odpt:calendarTitle": z.optional(multiLanguage),
	"odpt:day": z.optional(z.array(xsdDate)),
	"odpt:duration": z.optional(z.string()),
});

export const OdptCalendar = {
	name: dataname,
	params: calendarParams,
	data: odptCalendar,
} as const satisfies EndpointConfig;
