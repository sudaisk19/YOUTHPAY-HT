/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  outputFileTracingRoot: require('path').join(__dirname),
  compiler: {
    styledComponents: true,
  },
};
