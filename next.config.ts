import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Gather-hosted cover & inline images
      { protocol: "https", hostname: "vritti.shownomore.com", pathname: "/api/files/**" },
      // Author avatars (uploadthing)
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
    ],
  },
};

export default nextConfig;
