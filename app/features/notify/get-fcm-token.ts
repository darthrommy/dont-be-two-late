import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { firebase } from "~/lib/firebase";

/**
 * Requests notification permission and retrieves the FCM token.
 *
 * **Be sure** to call this function in response to a user gesture (e.g., button click)
 * to comply with browser security policies.
 * @returns The FCM token.
 */
export const getFcmToken = async () => {
	const permission = await Notification.requestPermission();

	if (permission !== "granted") {
		console.error("Notification permission not granted");
		throw new Error("Notification permission not granted");
	}

	const supported = await isSupported();

	if (!supported) {
		console.error("Firebase Messaging is not supported in this browser");
		throw new Error("Firebase Messaging is not supported in this browser");
	}

	try {
		const worker = await navigator.serviceWorker.register(
			import.meta.env.MODE === "production"
				? "/fcm-sw.js"
				: "/dev-sw.js?dev-sw",
			{
				type: import.meta.env.MODE === "production" ? "classic" : "module",
			},
		);

		const token = await getToken(getMessaging(firebase), {
			vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
			serviceWorkerRegistration: worker,
		});

		return token;
	} catch (error) {
		console.error("Error getting FCM token:", error);
		throw error;
	}
};
