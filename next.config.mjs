/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Bypass the Image Optimization API to avoid 404 from /_next/image in some envs
    // (can be removed later if you prefer Next's optimizer)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
