import { createRequestHandler } from "react-router";
import { type DBInstance, getDbInstance } from "~/lib/db.server";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
		db: DBInstance;
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		console.log(
			"API Keys:",
			env.GOOGLE_MAPS_API_KEY,
			env.ODPT_API_KEY,
			env.ODPT_LIMITED_API_KEY,
		);
		const db = getDbInstance(env);
		return requestHandler(request, {
			cloudflare: { env, ctx },
			db,
		});
	},
} satisfies ExportedHandler<Env>;
