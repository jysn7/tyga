import type { NextConfig } from "next"
import { withSerwist } from "@serwist/turbopack"

const supabaseHost =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") ??
  "gbfhezylpwodiasnxsce.supabase.co"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default withSerwist(nextConfig)
