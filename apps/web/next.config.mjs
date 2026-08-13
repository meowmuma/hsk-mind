/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@hsk-mind/game-config",
    "@hsk-mind/shared-types",
    "@hsk-mind/shared-utils",
  ],
};

export default nextConfig;
