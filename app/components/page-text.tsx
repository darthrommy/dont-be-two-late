type PageTitleProps = {
	title: string[];
};
export const PageTitle = ({ title }: PageTitleProps) => {
	return (
		<h1 className="grid text-[72px] tracking-[-3.6px] leading-none">
			{title.map((line, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: no interactivity
				<span key={index}>{line}</span>
			))}
		</h1>
	);
};

type PageDescriptionProps = {
	description: string[];
};
export const PageDescription = ({ description }: PageDescriptionProps) => {
	return (
		<p className="leading-snug tracking-tight inline-grid">
			{description.map((line, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: no interactivity
				<span key={index}>{line}</span>
			))}
		</p>
	);
};
