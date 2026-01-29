/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "86.48.22.80",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
    ],
  },
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
        source: "/public/:path*",
        destination: `${baseTarget}/public/:path*`,
      },
      {
        source: "/backend/:path*",
        destination: `${baseTarget}/:path*`,
      },
    ];
  },

};

export default nextConfig;
