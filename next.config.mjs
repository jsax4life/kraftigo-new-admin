/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kraftigo-space.fra1.cdn.digitaloceanspaces.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "kraftigo-space.fra1.digitaloceanspaces.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;

