import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtools from "vite-plugin-devtools-json";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
		devtools(),
		VitePWA({
			strategies: "injectManifest",
			srcDir: "app/lib",
			filename: "fcm-sw.ts",
			injectRegister: false,
			devOptions: {
				enabled: true,
				type: "module",
			},
			registerType: "autoUpdate",
			workbox: {
				cleanupOutdatedCaches: true,
			},
			injectManifest: {
				injectionPoint: undefined,
			},
			manifest: false,
			outDir: "build/client",
		}),
	],
});
