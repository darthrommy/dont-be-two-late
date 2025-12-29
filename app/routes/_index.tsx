import type { Route } from "./+types/_index";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export function loader(_: Route.LoaderArgs) {
	return {};
}

export default function Home(_: Route.ComponentProps) {
	return <div>Hello</div>;
}
