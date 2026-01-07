import {
	CamelCasePlugin,
	type ColumnType,
	type GeneratedAlways,
	Kysely,
} from "kysely";
import { D1Dialect } from "kysely-d1";

type Immutable<T> = ColumnType<T, T, never>;

export interface T_Session {
	/**
	 * UUID v4 session ID.
	 * @private
	 */
	id: Immutable<string>;
	createdAt: GeneratedAlways<string>;
	destLat: number;
	destLon: number;
}

export interface T_Checking {
	id: GeneratedAlways<number>;
	createdAt: GeneratedAlways<string>;
	sessionId: string;
	stationId: string;
	operatorId: string;
	departureTime: number;
	fare: number;
	fromLat: number;
	fromLon: number;
	// taxiFare: number; // optional column for future use
}

type Database = {
	session: T_Session;
	checking: T_Checking;
};

/**
 * Create a Kysely database instance connected to the D1 database.
 * @param env - The Cloudflare environment containing the D1 database.
 * @returns A Kysely instance connected to the D1 database.
 * @example
 * export const loader = async ({ context }: Route.LoaderArgs) => {
 *   const db = getDbInstance(context.cloudflare.env);
 *   const res = await db.selectFrom("film_stock").selectAll().execute();
 *   return res;
 * }
 */
export const getDbInstance = (env: Env) => {
	return new Kysely<Database>({
		dialect: new D1Dialect({ database: env.odpt_db }),
		plugins: [new CamelCasePlugin()],
	});
};

export type DBInstance = ReturnType<typeof getDbInstance>;
