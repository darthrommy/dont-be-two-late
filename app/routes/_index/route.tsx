import type { Route } from "./+types/route";

export const loader = async (_: Route.LoaderArgs) => {
	return {};
};

export default function Home(_: Route.ComponentProps) {
	return <></>;
}
