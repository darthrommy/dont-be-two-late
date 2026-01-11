import { cn } from "~/lib/utils";
import type { TwoLateStatus } from "../_lib/use-twolate-status";

const CHECK_TEXT = {
	safe: {
		statusText: "Definitely, Yes.",
		statusColor: "text-green-500",
		description: "You still have enough time.",
	},
	advised: {
		statusText: "Leave now!",
		statusColor: "text-amber-500",
		description:
			"You're about to miss the 2nd train before the last. Leave now with a relaxed mind.",
	},
	hurry: {
		statusText: "Hurry Up!!!",
		statusColor: "text-red-500",
		description:
			"You're about to miss the REAL last train!!! Just leave now to save money!!!",
	},
} as const satisfies {
	[key in TwoLateStatus]: {
		statusText: string;
		statusColor: string;
		description: string;
	};
};

type StatusTextProps = {
	status: TwoLateStatus;
};

export const StatusText = ({ status }: StatusTextProps) => {
	return (
		<div className="space-y-2">
			<h1 className="text-2xl/none tracking-tighter font-medium">
				Can I get the last trains?
			</h1>
			<p
				className={cn(
					CHECK_TEXT[status].statusColor,
					"text-5xl/none tracking-tighter font-medium",
				)}
			>
				{CHECK_TEXT[status].statusText}
			</p>
			<p className="tracking-tight leading-snug">
				{CHECK_TEXT[status].description}
			</p>
		</div>
	);
};
