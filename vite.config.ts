import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
	// Served from https://<user>.github.io/prode-2026-stats/ on GitHub Pages, so
	// the app needs to know its base path for builds. Empty during `vite dev`.
	const base = command === 'build' ? '/prode-2026-stats' : '';

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},

				// Static export for GitHub Pages. The whole site is prerendered to
				// plain HTML/CSS/JS (see src/routes/+layout.ts).
				adapter: adapter({
					fallback: '404.html'
				}),
				paths: {
					base
				}
			})
		]
	};
});
