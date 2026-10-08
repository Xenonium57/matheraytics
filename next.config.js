const path = require("path");

const nextConfig = {
  webpack: config => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    config.resolve.alias["~"] = path.join(__dirname, "src");
    return config;
  },
};

module.exports = nextConfig;