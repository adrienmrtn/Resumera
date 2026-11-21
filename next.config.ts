import type { NextConfig } from "next";

const config: NextConfig = {
  // mammoth and the PDF renderer are plain Node libraries; keep them out of the server bundle.
  serverExternalPackages: ["mammoth"],
};

export default config;
