// config-overrides.js
module.exports = function override(config, env) {
    config.ignoreWarnings = [
      {
        module: /node_modules\/html5-qrcode/,
        message: /Failed to parse source map/
      }
    ];
    return config;
  };
  