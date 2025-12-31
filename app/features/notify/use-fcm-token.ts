import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { useCallback, useState } from "react";

const firebase = initializeApp({
	apiKey: "AIzaSyBs-2o9MDa3o4_RbpeSHssiG_4n-zHOydY",
	authDomain: "fcm-experiment-odpt.firebaseapp.com",
	projectId: "fcm-experiment-odpt",
	storageBucket: "fcm-experiment-odpt.firebasestorage.app",
	messagingSenderId: "186001523224",
	appId: "1:186001523224:web:d50d096594e7d3941b396d",
});

export const useFcmToken = () => {
	const [token, setToken] = useState<string | null>(null);

	const getFCMToken = useCallback(async () => {
		const permission = await Notification.requestPermission();
		if (permission !== "granted") {
			console.warn("Notification permission not granted.");
			return;
		}

		const supported = await isSupported();
		console.log("FCM supported:", supported);
		if (!supported) {
			return;
		}

		try {
			const worker = await navigator.serviceWorker.register(
				import.meta.env.MODE === "production" ? "/sw.js" : "/dev-sw.js?dev-sw",
				{
					type: import.meta.env.MODE === "production" ? "classic" : "module",
				},
			);
			const token = await getToken(getMessaging(firebase), {
				vapidKey: import.meta.env.VITE_VAPID_KEY,
				serviceWorkerRegistration: worker,
			});

			setToken(token);
		} catch (e) {
			console.error("Failed to get FCM token:", e);
		}
	}, []);

	return { token, getFCMToken };
};
