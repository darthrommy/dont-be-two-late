import { getApp, getApps, initializeApp } from "firebase/app";

export const firebase = getApps().length
	? getApp()
	: initializeApp({
			apiKey: import.meta.env.VITE_FCM_API_KEY,
			authDomain: import.meta.env.VITE_FCM_AUTH_DOMAIN,
			projectId: import.meta.env.VITE_FCM_PROJECT_ID,
			storageBucket: import.meta.env.VITE_FCM_STORAGE_BUCKET,
			messagingSenderId: import.meta.env.VITE_FCM_MESSAGING_SENDER_ID,
			appId: import.meta.env.VITE_FCM_APP_ID,
			measurementId: import.meta.env.VITE_FCM_MEASUREMENT_ID,
		});
