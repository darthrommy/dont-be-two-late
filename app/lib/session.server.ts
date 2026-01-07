import * as cookie from "cookie";
import { z } from "zod/mini";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_LIFETIME = 60 * 60 * 24 * 2; // 2 days
const sessionCookieSchema = z.partial(
	z.object({
		[SESSION_COOKIE_NAME]: z.string().check(z.uuidv7()),
	}),
);

export const getSessionId = (cookieString: string): string | null => {
	const rawCookies = cookie.parse(cookieString);
	const parsedCookies = sessionCookieSchema.safeParse(rawCookies);

	if (!parsedCookies.success) {
		return null;
	}

	return parsedCookies.data[SESSION_COOKIE_NAME] || null;
};

export const createSession = (sessionId: string): string => {
	const setCookie = cookie.serialize(SESSION_COOKIE_NAME, sessionId, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		maxAge: SESSION_LIFETIME,
	});

	return setCookie;
};

export const purgeSession = () => {
	const setCookie = cookie.serialize(SESSION_COOKIE_NAME, "", {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		maxAge: 0,
	});

	return setCookie;
};
