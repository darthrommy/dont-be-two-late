import {
	CarTaxiFrontIcon,
	FootprintsIcon,
	PlaneTakeoffIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import type { TwoLateStatus } from "../_lib/use-twolate-status";
import type { Route } from "../+types/route";

type TwoLastInfoProps = {
	state: TwoLateStatus;
} & Route.ComponentProps["loaderData"];

const getMinutesLeft = (deadline: string) => {
	const now = Date.now();
	const deadlineTime = new Date(deadline).getTime();
	const minsLeft = Math.floor((deadlineTime - now) / (1000 * 60));
	return minsLeft;
};

export const TwoLastInfo = ({ state, station, check }: TwoLastInfoProps) => {
	const leaveTimeFormatted = new Date(check.leaveTime).toLocaleTimeString(
		"ja-JP",
		{
			minute: "2-digit",
			hour: "2-digit",
		},
	);

	const departureTimeFormatted = new Date(
		check.departureTime,
	).toLocaleTimeString("ja-JP", {
		minute: "2-digit",
		hour: "2-digit",
	});

	const [minsLeft, setMinsLeft] = useState(() =>
		getMinutesLeft(check.leaveTime),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setMinsLeft(getMinutesLeft(check.leaveTime));
		}, 60000);

		return () => clearInterval(interval);
	}, [check.leaveTime]);

	return (
		<div className="flex flex-col gap-y-2">
			{state === "hurry" ? (
				<div className="grid">
					<div className="text-[28px]/none tracking-tighter bg-foreground text-background px-2 py-1 w-fit">
						Save up to...
					</div>
					<div className="text-teal-500 underline underline-offset-8 text-8xl/none font-medium underline-from-font tracking-tighter">
						¥{(check.taxiFare - check.fare).toLocaleString("en-US")}
					</div>
				</div>
			) : (
				<p className="flex items-baseline gap-x-1">
					<span className="text-8xl/none font-medium tracking-tighter">
						{minsLeft}
					</span>
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
					<InfoItem>{state === "hurry" ? "now" : leaveTimeFormatted}</InfoItem>
				</InfoGroup>
				<InfoGroup>
					<InfoItem>
						<PlaneTakeoffIcon />
						{station.operator}
					</InfoItem>
					<InfoItem invert>{station.stationName}</InfoItem>
					<InfoItem>{departureTimeFormatted}</InfoItem>
					<InfoItem invert>¥{check.fare.toLocaleString("en-US")}</InfoItem>
				</InfoGroup>
				<InfoGroup>
					<InfoItem>
						<CarTaxiFrontIcon />
						Estimated Taxi Fare
					</InfoItem>
					<InfoItem invert>¥{check.taxiFare}</InfoItem>
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
