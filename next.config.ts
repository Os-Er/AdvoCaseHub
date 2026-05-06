import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // v1 makbuzlar → v2 finans/makbuzlar
      {
        source: "/makbuzlar",
        destination: "/finans/makbuzlar",
        permanent: true,
      },
      {
        source: "/makbuzlar/yeni",
        destination: "/finans/makbuzlar/yeni",
        permanent: true,
      },
      {
        source: "/makbuzlar/:id",
        destination: "/finans/makbuzlar",
        permanent: true,
      },
      {
        source: "/makbuzlar/:id/duzenle",
        destination: "/finans/makbuzlar",
        permanent: true,
      },
      {
        source: "/makbuzlar/import",
        destination: "/finans/makbuzlar",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
