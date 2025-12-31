import { searchRoute } from "~/features/search";
import type { Route } from "./+types/route";

export const loader = async ({ context }: Route.LoaderArgs) => {
	const route = await searchRoute("本郷三丁目", "渋谷", context.cloudflare.env);
	return route;
};
