import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";
import { BaseLayout } from "~/components/layout";
import type { Route } from "./+types/route";

export default function LandingPage(_: Route.ComponentProps) {
	return (
		<BaseLayout>
			<h1 className="grid text-[128px] tracking-[-9px] leading-[85%]">
				<span>Don't</span>
				<span>Be</span>
				<span>Two</span>
				<span>Late</span>
			</h1>

			<Link
				to={"/setup/welcome"}
				className="text-background bg-foreground text-4xl/none items-center tracking-tighter px-6 py-4 w-fit inline-flex gap-x-2"
			>
				get started <ArrowRightIcon className="size-9" />
			</Link>
		</BaseLayout>
	);
}
