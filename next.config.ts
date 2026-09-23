import type { NextConfig } from "next"
import { withSerwist } from "@serwist/turbopack"

const nextConfig: NextConfig = {
  // your existing config
}

export default withSerwist(nextConfig)
