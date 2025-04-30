"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TokenCard } from "@/components/token-card"
import { useTokens } from "@/context/token-context"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { BadgeCheck } from "lucide-react"

export default function TokensPage() {
  const { tokens, loading, refreshTokens } = useTokens()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Refresh tokens when the page loads
  useEffect(() => {
    refreshTokens()
  }, [refreshTokens])

  // Get the most recently created token
  const newestToken =
    tokens.length > 0
      ? tokens.reduce((newest, token) => ((token.createdAt || 0) > (newest.createdAt || 0) ? token : newest), tokens[0])
      : null

  // Separate real tokens from custom tokens
  const realTokens = tokens.filter((token) => token.isReal)
  const customTokens = tokens.filter((token) => !token.isReal)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshTokens()
    setIsRefreshing(false)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="container px-4 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Discover Tokens</h2>
          <p className="text-gray-400">Find and trade the latest Solana tokens</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="border-orange-500/30 text-orange-400 transition-all duration-300 hover:scale-105"
          disabled={loading || isRefreshing}
        >
          {loading || isRefreshing ? "Refreshing..." : "Refresh Tokens"}
        </Button>
      </div>

      {/* New token notification */}
      {newestToken && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-3 mb-8 bg-orange-500/10 border border-orange-500/30 rounded-lg text-white flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span>
              New token launched: <strong>{newestToken.ticker}</strong> is now available!
            </span>
          </div>
          <Link href={`/token/${newestToken.id}`}>
            <Button variant="outline" size="sm" className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10">
              View
            </Button>
          </Link>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-400 mb-4">No tokens found</p>
          <Link href="/create">
            <Button className="connect-wallet-btn transition-all duration-300 hover:scale-105">
              Create Your First Token
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Real Tokens Section */}
          {realTokens.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-xl font-bold">Real Tokens</h3>
                <BadgeCheck className="h-5 w-5 text-blue-500" />
              </div>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {realTokens.map((token) => (
                  <motion.div key={token.id} variants={item}>
                    <TokenCard token={token} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Custom Tokens Section */}
          {customTokens.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-6">Custom Tokens</h3>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {customTokens.map((token) => (
                  <motion.div key={token.id} variants={item}>
                    <TokenCard token={token} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
