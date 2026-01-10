import * as cookie from "cookie";

const COOKIE_NAME = "fcm_token";

export const getFcmTokenCookieHeader = (token: string) => {
	return cookie.serialize(COOKIE_NAME, token, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});
};

export const getFcmTokenFromCookie = (cookieHeader: string | null) => {
	if (!cookieHeader) {
		return null;
	}

	const cookies = cookie.parse(cookieHeader);
	return cookies[COOKIE_NAME] || null;
};

export const getPurgeFcmTokenCookieHeader = () => {
	return cookie.serialize(COOKIE_NAME, "", {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 0,
	});
};
