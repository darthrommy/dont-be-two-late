export const useGeolocation = () => {
	const getCurrentPosition = async () => {
		return await new Promise<GeolocationPosition>((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject);
		});
	};

	return { getCurrentPosition };
};
