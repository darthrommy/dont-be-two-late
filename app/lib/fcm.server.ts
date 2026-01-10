import { env } from "cloudflare:workers";
import { FCM, FcmOptions } from "fcm-cloudflare-workers";

export const createFcm = () => {
	return new FCM(
		new FcmOptions({
			serviceAccount: {
				type: env.FCM_ACCOUNT_TYPE,
				project_id: env.FCM_PROJECT_ID,
				private_key_id: env.FCM_PRIVATE_KEY_ID,
				private_key: env.FCM_PRIVATE_KEY.replace(/\\n/g, "\n"),
				client_email: env.FCM_CLIENT_EMAIL,
				client_id: env.FCM_CLIENT_ID,
				auth_uri: env.FCM_AUTH_URI,
				token_uri: env.FCM_TOKEN_URI,
				auth_provider_x509_cert_url: env.FCM_AUTH_PROVIDER_X509_CERT_URL,
				client_x509_cert_url: env.FCM_CLIENT_X509_CERT_URL,
			},
		}),
	);
};
