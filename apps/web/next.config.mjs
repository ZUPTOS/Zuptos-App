/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (!target) {
      return [];
    }
    const normalizedTarget = target.replace(/\/$/, "");
    const baseTarget = normalizedTarget.replace(/\/v1\/?$/, "");
    return [
      {
        source: "/v1/:path*",
        destination: `${normalizedTarget}/:path*`,
      },
      {
        source: "/backend/:path*",
        destination: `${baseTarget}/:path*`,
      },
    ];
  },

};

export default nextConfig;
