import {
	BellElectricIcon,
	CodeXml,
	ShieldAlertIcon,
	ShieldCheckIcon,
	ShieldXIcon,
} from "lucide-react";
import { useFetcher } from "react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getFcmToken } from "~/features/notify/get-fcm-token";
import type { useTwoLateStatus } from "../_lib/use-twolate-status";

type DevtoolProps = {
	forceStatus: ReturnType<typeof useTwoLateStatus>["forceStatus"];
};

export const Devtool = ({ forceStatus }: DevtoolProps) => {
	const fetcher = useFetcher();
	const forceNotification = async () => {
		const token = await getFcmToken();
		fetcher.submit(
			{ token },
			{
				method: "post",
				action: "/force-notification",
			},
		);
	};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={
					"fixed top-8 right-6 rounded-full bg-zinc-900 border flex items-center justify-center size-12"
				}
			>
				<CodeXml />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className={"w-48"}>
				<div className="text-lg font-medium tracking-tight p-2">Devtool</div>
				<DropdownMenuGroup>
					<DropdownMenuLabel>Hurry State</DropdownMenuLabel>
					<DropdownMenuItem onClick={() => forceStatus("safe")}>
						<ShieldCheckIcon />
						Force Safe
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => forceStatus("advised")}>
						<ShieldAlertIcon />
						Force Leave now
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => forceStatus("hurry")}>
						<ShieldXIcon />
						Force Hurry
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel>Notification</DropdownMenuLabel>
					<DropdownMenuItem onClick={forceNotification}>
						<BellElectricIcon />
						Force Notification
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
