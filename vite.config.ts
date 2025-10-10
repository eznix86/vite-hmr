import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	mode: "production",
	build: {
		ssr: true,
		lib: {
			entry: fileURLToPath(new URL("index.ts", import.meta.url)),
			name: "vite-hmr",
			fileName: "index",
			formats: ["es"],
		},
		rollupOptions: {
			external: [
				"vite",
				"node:fs",
				"node:path",
				"node:url",
				"vite-plugin-full-reload",
			],
		},
	},
	plugins: [
		dts({
			exclude: ["tsconfig.json", "node_modules/**", "examples/**"],
			insertTypesEntry: true,
			pathsToAliases: true,
			rollupTypes: true,
		}),
	],
});
