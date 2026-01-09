import { FootprintsIcon, PlaneTakeoffIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type { TwoLateStatus } from "../_lib/use-twolate-status";
import type { Route } from "../+types/route";

type TwoLastInfoProps = {
	state: TwoLateStatus;
} & Route.ComponentProps["loaderData"];

export const TwoLastInfo = ({ state, station, check }: TwoLastInfoProps) => {
	return (
		<div className="flex flex-col gap-y-2">
			{state !== "hurry" && (
				<p className="flex items-baseline gap-x-1">
					<span className="text-8xl/none font-medium tracking-tighter">20</span>
					<span className="text-[2rem]/none tracking-tighter">mins left</span>
				</p>
			)}
			<div className="flex flex-col gap-y-1">
				<InfoGroup>
					<InfoItem>
						<FootprintsIcon />
						Leave
					</InfoItem>
					<InfoItem invert>here</InfoItem>
					<InfoItem>{state === "hurry" ? "now" : check.leaveTime}</InfoItem>
				</InfoGroup>
				<InfoGroup>
					<InfoItem>
						<PlaneTakeoffIcon />
						JR East
					</InfoItem>
					<InfoItem invert>
						{station["odpt:stationTitle"]?.en ?? station["dc:title"]}
					</InfoItem>
					<InfoItem>{check.departureTime}</InfoItem>
				</InfoGroup>
			</div>
		</div>
	);
};

const InfoGroup = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="border border-foreground flex items-center w-fit">
			{children}
		</div>
	);
};

const InfoItem = ({
	children,
	invert,
}: {
	children: React.ReactNode;
	invert?: boolean;
}) => {
	return (
		<div
			className={cn(
				"flex items-center gap-x-2 px-2.5 py-1.5 [&_svg]:size-4 font-medium tracking-tight leading-none",
				!invert && "bg-foreground text-background",
			)}
		>
			{children}
		</div>
	);
};
