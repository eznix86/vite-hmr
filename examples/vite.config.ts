import { defineConfig } from "vite";
import hmr from "vite-hmr";

export default defineConfig({
	plugins: [
		hmr({
			input: ["src/main.ts", "src/style.css"],
			refresh: true,
		}),
	],
});
