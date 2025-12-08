import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL('https://fcb-abj-pre.s3.amazonaws.com/img/jugadors/MESSI.jpg'),
    ],
  },
};

export default nextConfig;
