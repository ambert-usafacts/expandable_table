import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: "docs",
			assets: "docs",
			fallback: null,
		}),
		paths: {
			base: process.env.NODE_ENV === "production" ? "/expandable_table" : "",
		},
	},
};

export default config;
