const swSelf = self as unknown as ServiceWorkerGlobalScope;

swSelf.addEventListener("install", (event) => {
	console.log("Service Worker installing.");
	event.waitUntil(swSelf.skipWaiting());
});

swSelf.addEventListener("activate", (event) => {
	console.log("Service Worker activating.");
	event.waitUntil(swSelf.clients.claim());
});

swSelf.addEventListener("push", (event) => {
	console.log("[FCM CUSTOM RECEIVER] Push received.", event);

	if (!event.data) {
		console.log("Push event has no data.");
		return;
	}

	const data = event.data.json();

	console.log(data);

	event.waitUntil(
		swSelf.registration.showNotification(data.notification.title, {
			body: data.notification.body,
			data: data.data,
		}),
	);
});

swSelf.addEventListener("notificationclick", (event) => {
	console.log("[FCM CUSTOM RECEIVER] Notification click received.", event);

	event.notification.close();

	const pathToOpen = event.notification.data?.click_action || "/";
	const urlToOpen = new URL(pathToOpen, swSelf.location.origin).href;

	// This looks to see if the current is already open and
	// focuses if it is
	event.waitUntil(
		swSelf.clients
			.matchAll({
				type: "window",
				includeUncontrolled: true,
			})
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url === urlToOpen && "focus" in client)
						return client.focus();
				}
				return swSelf.clients.openWindow(urlToOpen);
			}),
	);
});
