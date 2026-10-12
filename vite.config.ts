import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
	// playground for manual testing: `yarn manual`
	root: resolvePath("./src/__manual_tests__"),
	plugins: [react()],
	resolve: {
		alias: {
			"@": resolvePath("./src"),
		},
	},
	server: {
		port: 4200,
		open: true,
	},
	test: {
		root: resolvePath("."),
		include: ["src/__tests__/**/*.spec.{ts,tsx}"],
		environment: "jsdom",
		restoreMocks: true,
	},
});
