/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SENDOR_PROGRAM_ID: "6mqsEaGREVXfAroU9WErmEPqYmKoFpoMHuFHzvBBGgna",
    SOLANA_RPC_ENDPOINT: "https://api.devnet.solana.com",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
