const SESSION_KEY = "sessionId";

export const getSession = () => {
	const id = localStorage.getItem(SESSION_KEY);
	return id;
};

export const setSession = (id: string) => {
	localStorage.setItem(SESSION_KEY, id);
};
