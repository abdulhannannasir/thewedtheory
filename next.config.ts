import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF is about a third smaller than WebP at the same quality, which is most of what a phone
    // downloads on this site. Browsers without AVIF get WebP.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
