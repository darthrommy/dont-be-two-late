import { useEffect, useState } from "react";

export type TwoLateStatus = "safe" | "advised" | "hurry";

const determineStatus = (deadline: string): TwoLateStatus => {
	const now = Date.now();
	const deadlineTime = new Date(deadline).getTime();
	const minsLeft = Math.floor((deadlineTime - now) / (1000 * 60));

	if (minsLeft > 15) {
		return "safe";
	} else if (minsLeft > 5) {
		return "advised";
	} else {
		return "hurry";
	}
};

/**
 * Hook to get the current TwoLateStatus based on the given deadline.
 * @param deadline ISO8601 string representing the leave time
 * @returns An object containing the current status and a function to forcefully set the status.
 */
export const useTwoLateStatus = (deadline: string) => {
	const [status, setStatus] = useState<TwoLateStatus>(() =>
		determineStatus(deadline),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setStatus(determineStatus(deadline));
		}, 60000);

		return () => clearInterval(interval);
	}, [deadline]);

	return { status, forceStatus: setStatus };
};
