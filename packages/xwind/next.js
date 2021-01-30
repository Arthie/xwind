module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  const tailwindConfigPath = pluginOptions.config || "./tailwind.config.js";
  const babelOptions = pluginOptions.babel || {
    presets: ["next/babel"],
    plugins: [],
  };

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      const loaderOptions = {
        config: tailwindConfigPath,
        babel: babelOptions,
      };

      const rules = [];
      for (const rule of config.module.rules) {
        if (rule.test instanceof RegExp && rule.test.test(".js")) {
          if (Array.isArray(rule.use)) {
            rule.use.push({
              loader: "xwind/lib/webpack/loader",
              options: loaderOptions,
            });
          } else {
            rule.use = [
              rule.use,
              {
                loader: "xwind/lib/webpack/loader",
                options: loaderOptions,
              },
            ];
          }
        }
        rules.push(rule);
      }
      config.module.rules = rules;

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
};
