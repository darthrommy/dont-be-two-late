import { env } from "cloudflare:workers";
import {
	CamelCasePlugin,
	type ColumnType,
	type GeneratedAlways,
	Kysely,
} from "kysely";
import { D1Dialect } from "kysely-d1";

type Immutable<T> = ColumnType<T, T, never>;

export interface T_Fcm_Token {
	token: Immutable<string>;
}

export interface T_Destination {
	id: GeneratedAlways<number>;
	createdAt: Immutable<string>;
	token: string;
	latitude: number;
	longitude: number;
}

export interface T_Estimation {
	id: GeneratedAlways<number>;
	createdAt: Immutable<string>;
	destinationId: number;
	stationId: string;
	departureTime: string;
	leaveTime: string;
	originLatitude: number;
	originLongitude: number;
	fare: number;
	taxiFare: number;
}

export interface T_Message_Queue {
	id: GeneratedAlways<number>;
	createdAt: Immutable<string>;
	estimationId: number;
	scheduledAt: string;
	sentAt: string | null;
	canceledAt: string | null;
}

type Database = {
	fcm_token: T_Fcm_Token;
	destination: T_Destination;
	estimation: T_Estimation;
	message_queue: T_Message_Queue;
};

/**
 * Create a Kysely database instance connected to the D1 database.
 * @returns A Kysely instance connected to the D1 database.
 * @example
 * export const loader = async ({ context }: Route.LoaderArgs) => {
 *   const db = getDbInstance(context.cloudflare.env);
 *   const res = await db.selectFrom("film_stock").selectAll().execute();
 *   return res;
 * }
 */
export const getDbInstance = () => {
	return new Kysely<Database>({
		dialect: new D1Dialect({ database: env.odpt_db }),
		plugins: [new CamelCasePlugin()],
	});
};

export type DBInstance = ReturnType<typeof getDbInstance>;
