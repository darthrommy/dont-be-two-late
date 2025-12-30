export const ODPT_BASE_URLs = [
	"https://api.odpt.org/api/v4/",
	"https://api-challenge.odpt.org/api/v4/",
] as const satisfies readonly `https://api${string}.odpt.org/api/v4/`[];
export type ODPT_BASE_URL = (typeof ODPT_BASE_URLs)[number];
