export const BaseLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="flex flex-col min-h-dvh justify-end px-6 py-8 gap-y-8">
			{children}
		</main>
	);
};
