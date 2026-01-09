import { useEffect, useState } from "react";

export type TwoLateStatus = "safe" | "advised" | "hurry";

const determineStatus = (minsLeft: number): TwoLateStatus => {
	if (minsLeft > 15) {
		return "safe";
	} else if (minsLeft > 5) {
		return "advised";
	} else {
		return "hurry";
	}
};

const getMinutesPassedToday = (): number => {
	const now = new Date();
	const hours = now.getHours() < 5 ? now.getHours() + 24 : now.getHours();
	const minutesPassed = hours * 60 + now.getMinutes();
	return minutesPassed;
};

export const useTwoLateStatus = (deadline: number) => {
	const [status, setStatus] = useState<TwoLateStatus>(() =>
		determineStatus(deadline - getMinutesPassedToday()),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			const minsLeft = deadline - getMinutesPassedToday();
			setStatus(determineStatus(minsLeft));
		}, 60000);

		return () => clearInterval(interval);
	}, [deadline]);

	return { status, forceStatus: setStatus };
};
