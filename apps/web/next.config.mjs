/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (!target) {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${target.replace(/\/$/, "")}/:path*`,
      },
      {
        source: "/api-public/:path*",
        destination: `${target.replace(/\/v1\/?$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
