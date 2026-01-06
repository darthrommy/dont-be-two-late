/**
 * Type definition for a railway station, distinct from ODPT schema types
 */
export type Station = {
	/**
	 * Station identifiers
	 * @example "odpt.Station:JR-East.Yamanote.Shibuya"
	 */
	id: string;
	/**
	 * Station name
	 * @example "渋谷"
	 */
	title: string;
	/**
	 * Operator identifier
	 * @example "odpt.Operator:JR-East"
	 */
	operator: string;
	/**
	 * Railway identifier
	 * @example "odpt.Railway:JR-East.Yamanote"
	 */
	railway: string;
	/**
	 * Timetable identifiers
	 * @example ["odpt.StationTimetable:JR-East.Yamanote.Shibuya.Weekday"]
	 */
	timetable: string[];
	/**
	 * Connected station identifiers
	 * @example ["odpt.Station:TokyoMetro.Ginza.Shibuya", "odpt.Station:Toei.Oedo.Shibuya"]
	 */
	connection: string[];
};

/**
 * Type definition for a railway line, distinct from ODPT schema types
 */
export type Railway = {
	/**
	 * Railway identifiers
	 * @example "odpt.Railway:JR-East.Yamanote"
	 */
	id: string;
	/**
	 * Railway name
	 * @example "山手線"
	 */
	title: string;
	/**
	 * Operator identifier
	 * @example "odpt.Operator:JR-East"
	 */
	operator: string;
	/**
	 * Array of stations on the railway line
	 * @example [{ id: "odpt.Station:JR-East.Yamanote.Shibuya", index: 1 }, ...]
	 */
	stations: { id: string; index: number }[];
	/**
	 * Ascending direction name
	 * @example "odpt.RailDirection:Northbound"
	 */
	ascendingDir: string;
	/**
	 * Descending direction name
	 * @example "odpt.RailDirection:Southbound"
	 */
	descendingDir: string;
};

/**
 * Type definition for the station graph used in search
 */
export type StationGraph = {
	[stationId: string]: {
		/**
		 * Identifiers of identical (transfer) stations
		 * @example ["odpt.Station:TokyoMetro.Ginza.Shibuya", "odpt.Station:Toei.Oedo.Shibuya"]
		 */
		identical: string[];
		/**
		 * Previous stations with travel directions
		 * @example [{ id: "odpt.Station:JR-East.Yamanote.Shinjuku", direction: "odpt.RailDirection:Northbound" }]
		 */
		prev: { id: string; direction: string }[];
	};
};

/**
 * Type definition for a station timetable, distinct from ODPT schema types
 */
export type StationTimetable = {
	/**
	 * Station identifier
	 * @example "odpt.Station:JR-East.Yamanote.Shibuya"
	 */
	station: string;
	/**
	 * Operator identifier
	 * @example "odpt.Operator:JR-East"
	 */
	operator: string;
	/**
	 * Railway identifier
	 * @example "odpt.Railway:JR-East.Yamanote"
	 */
	railway: string;
	/**
	 * Calendar type
	 * @example "odpt.Calendar:Weekday"
	 */
	calendar: string;
	/**
	 * Rail direction
	 * @example "odpt.RailDirection:Northbound"
	 */
	direction: string;
	/**
	 * Array of train timetables
	 */
	timetable: { id: string; time: number }[];
};

/**
 * Type definition for a train timetable, distinct from ODPT schema types
 */
export type TrainTimetable = {
	/**
	 * Train identifier
	 * @example "odpt.Train:JR-East.Yamanote.T1234"
	 */
	id: string;
	/**
	 * Operator identifier
	 * @example "odpt.Operator:JR-East"
	 */
	operator: string;
	/**
	 * Railway identifier
	 * @example "odpt.Railway:JR-East.Yamanote"
	 */
	railway: string;
	/**
	 * Calendar type
	 * @example "odpt.Calendar:Weekday"
	 */
	calendar: string;
	/**
	 * Array of station timetables for the train
	 */
	timetable: {
		/**
		 * Station identifier
		 * @example "odpt.Station:JR-East.Yamanote.Shibuya"
		 */
		station: string;
		/**
		 * Arrival time in minutes since midnight, or null if not applicable
		 * @example 1320
		 */
		arrivalTime: number | null;
		/**
		 * Departure time in seconds since midnight, or null if not applicable
		 * @example 1321
		 */
		departureTime: number | null;
	}[];
};

export type GraphNode = {
	id: string;
	operator: string;
	railway: string;
	event: "passthrough" | "transfer" | "terminal";
	prev: GraphNode[];
};

export type FlattenedGraph = Omit<GraphNode, "prev">;

export type RouteItem = {
	fromId: string;
	toId: string;
	railway: string;
	operator: string;
};

export type RouteItemWithTime = RouteItem & {
	arrivesAt: number;
	departsAt: number;
};

export type RouteObject = {
	from: string;
	to: string;
	fare: number;
	items: RouteItemWithTime[];
};
