import type { ReactNode } from "react";
import { Link } from "react-router";
import { twJoin, twMerge } from "tailwind-merge";

export const buttonStyle = (...classes: string[]) => {
	return twMerge(
		"text-background bg-foreground text-2xl/none items-center tracking-tighter px-6 py-4 w-fit inline-flex gap-x-2 [&_svg]:size-6",
		twJoin(...classes),
	);
};

type ButtonLinkProps = {
	to: string;
	children: ReactNode;
};

export const ButtonLink = ({ to, children }: ButtonLinkProps) => {
	return (
		<Link to={to} className={buttonStyle()}>
			{children}
		</Link>
	);
};
