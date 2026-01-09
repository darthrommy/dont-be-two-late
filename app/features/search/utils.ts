export const OPERATORS = ["JR-East", "Toei", "TokyoMetro"] as const;
export type Operator = (typeof OPERATORS)[number];

export const RAILWAYS = {
	"JR-East": ["ShonanShinjuku", "SaikyoKawagoe", "Yamanote"],
	Toei: ["Oedo"],
	TokyoMetro: ["Marunouchi", "Ginza", "Fukutoshin"],
} as const satisfies Record<Operator, readonly string[]>;
type Line<T extends Operator> = (typeof RAILWAYS)[T][number];

/**
 * Get ODPT operator identifier
 * @param operator Operator code
 * @returns ODPT operator identifier
 */
export const getOperatorId = (operator: Operator) => {
	return `odpt.Operator:${operator}`;
};
export const extractOperator = (odptOperatorId: string) => {
	return odptOperatorId.replace("odpt.Operator:", "") as Operator;
};

/**
 * Get ODPT railway identifier
 * @param operator Operator ID
 * @param line Line name
 * @returns ODPT railway identifier
 */
export const getRailwayId = <T extends Operator>(
	operator: T,
	line: Line<T>,
) => {
	return `odpt.Railway:${operator}.${line}`;
};

/**
 * Get all ODPT railway identifiers
 * @returns Array of ODPT railway identifiers
 */
export const getAllRailwayIds = () => {
	const railways = OPERATORS.flatMap((o) => {
		return RAILWAYS[o].map((l) => getRailwayId(o, l));
	});
	return railways;
};

export const IS_OPERATOR_LIMITED = {
	TokyoMetro: false,
	Toei: false,
	"JR-East": true,
} as const satisfies Record<Operator, boolean>;

export const convertTime = {
	/**
	 * Convert "HH:MM" time string to total minutes.
	 * If `HH >= 24`, it counts as next day.
	 * @param time Time string in "HH:MM" format
	 * @returns Total minutes
	 */
	toMinutes: (time: string) => {
		const [hours, minutes] = time.split(":").map(Number);
		const adjustedHours = hours >= 0 && hours < 4 ? hours + 24 : hours;
		return adjustedHours * 60 + minutes;
	},
	/**
	 * Separate total minutes to hh and mm.
	 * If total minutes exceed 1440 (24 hours), it wraps around.
	 * @param minutes Total minutes
	 * @returns Object with hrs and mins
	 */
	toHHMM: (minutes: number) => {
		const hrs = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return { hrs, mins };
	},
};
