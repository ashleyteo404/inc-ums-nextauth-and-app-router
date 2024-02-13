/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    webpack: (config, options) => {
        if (!options.dev) {
            config.devtool = "source-map";
          }
          return config;
        },
};

export default config;
