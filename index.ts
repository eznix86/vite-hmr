/**
 * A lightweight, framework-agnostic Vite plugin that provides:
 * - Automatic creation and cleanup of a "hot" file containing the dev server URL.
 * - Sensible defaults for output paths and manifest generation.
 * - Optional full-page reload support when files change.
 *
 * Inspired by Laravel’s Vite plugin, but without any framework coupling.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, PluginOption } from "vite";
import fullReload from "vite-plugin-full-reload";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Plugin configuration options.
 */
export interface HmrPluginOptions {
	/**
	 * Entry points to compile (e.g., JS, TS, or CSS files).
	 * Supports an array or a Rollup-style input map.
	 */
	input?: string[] | Record<string, string>;

	/**
	 * Directory where static assets are publicly served.
	 * Default: "public"
	 */
	publicDir?: string;

	/**
	 * Subdirectory (inside publicDir) where build output will be written.
	 * Default: "build"
	 */
	buildDir?: string;

	/**
	 * Path to the "hot" file used to store the running dev server URL.
	 * Default: "public/hot"
	 */
	hotFile?: string;

	/**
	 * Enables full-page reload when watched files change.
	 * - `true`: watches all input directories automatically
	 * - `string` or `string[]`: specific paths or globs to watch
	 * - `false`: disables full reload
	 * Default: false
	 */
	refresh?: boolean | string | string[];
}

/**
 * A Vite plugin that automatically manages a "hot" file and optional full-page reloads.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'vite'
 * import react from '@vitejs/plugin-react'
 * import hmr from '@eznix/hmr'
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     hmr({
 *       input: ['src/js/main.tsx', 'src/css/app.css'],
 *       refresh: true,
 *     }),
 *   ],
 * })
 * ```
 */
export default function hmr(options: HmrPluginOptions = {}): PluginOption {
	const {
		input = [],
		publicDir = "public",
		buildDir = "build",
		hotFile = path.join("public", "hot"),
		refresh = false,
	} = options;

	const plugin: Plugin = {
		name: "vite-plugin-hmr",
		enforce: "post",

		/**
		 * Extend the user’s Vite configuration to define:
		 * - outDir (e.g. "public/build")
		 * - manifest.json generation
		 * - clean Rollup output file structure
		 */
		config(userConfig) {
			return {
				publicDir: userConfig.publicDir ?? false,
				build: {
					outDir: path.join(publicDir, buildDir),
					manifest: true,
					rollupOptions: {
						input: Array.isArray(input)
							? input.map((i) => path.resolve(process.cwd(), i))
							: input,
						output: {
							entryFileNames: "js/[name].js",
							chunkFileNames: "js/[name]-[hash].js",
							assetFileNames: ({ name }) => {
								if (/\.css$/.test(name ?? "")) return "css/[name][extname]";
								if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? ""))
									return "images/[name][extname]";
								return "assets/[name][extname]";
							},
						},
					},
				},
			};
		},

		/**
		 * When running the dev server:
		 * - Write a "hot" file containing the local dev server URL.
		 * - Remove it automatically when the server shuts down.
		 */
		configureServer(server) {
			server.httpServer?.once("listening", () => {
				const address = server.httpServer?.address();

				const isAddressInfo = (
					addr: string | number | import("net").AddressInfo | null | undefined,
				): addr is import("net").AddressInfo =>
					typeof addr === "object" && addr !== null;

				const host = isAddressInfo(address)
					? address.address === "::"
						? "localhost"
						: address.address
					: "localhost";

				const port = isAddressInfo(address) ? address.port : 5173;
				const url = `http://${host}:${port}`;

				const hotDir = path.dirname(hotFile);
				if (!fs.existsSync(hotDir)) fs.mkdirSync(hotDir, { recursive: true });
				fs.writeFileSync(hotFile, url);
			});

			const cleanup = () => {
				if (fs.existsSync(hotFile)) fs.unlinkSync(hotFile);
			};

			server.httpServer?.on("close", cleanup);
			process.on("SIGINT", () => {
				cleanup();
				process.exit(0);
			});
			process.on("SIGTERM", () => {
				cleanup();
				process.exit(0);
			});
		},
	};

	/**
	 * Configure optional full-page reload behavior.
	 * - refresh: true → automatically watch directories containing input files
	 * - refresh: string[] → custom globs
	 * - refresh: false → disabled
	 */
	const refreshPlugin: PluginOption[] = (() => {
		if (refresh === false) return [];
		if (refresh === true) {
			const inputPaths = Array.isArray(input) ? input : Object.values(input);
			const roots = Array.from(
				new Set(inputPaths.map((p) => path.dirname(p.replace(/\\/g, "/")))),
			);
			return [fullReload(roots)];
		}
		if (Array.isArray(refresh)) return [fullReload(refresh)];
		if (typeof refresh === "string") return [fullReload([refresh])];
		return [];
	})();

	return [plugin, ...refreshPlugin];
}
