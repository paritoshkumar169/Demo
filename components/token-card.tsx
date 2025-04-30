import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, ArrowDownRight, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TokenCardProps {
  token: {
    id: string
    name: string
    ticker: string
    image: string
    price: number
    priceChange: number
    hasSellWindow: boolean
    isReal?: boolean
    priceUsd?: number
  }
}

export function TokenCard({ token }: TokenCardProps) {
  return (
    <Link href={`/token/${token.id}`}>
      <div
        className={`token-card p-4 h-full flex flex-col ${token.hasSellWindow ? "sell-window" : ""}`}
        style={{
          background: "linear-gradient(135deg, rgba(30, 30, 46, 0.8) 0%, rgba(15, 17, 26, 0.9) 100%)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image
              src={token.image || "/placeholder.svg?height=48&width=48"}
              alt={token.name}
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-lg">{token.name}</h3>
                {token.isReal && <BadgeCheck className="h-4 w-4 text-blue-500" />}
              </div>
              <p className="text-sm text-gray-400">${token.ticker}</p>
            </div>
          </div>
          {token.hasSellWindow && (
            <span className="px-2 py-1 text-xs bg-neon-red/20 text-neon-red-light rounded-full">Sell Open</span>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400">Price</p>
              <p className="font-bold">{token.price.toFixed(4)} SOL</p>
              {token.priceUsd && <p className="text-xs text-gray-400">${token.priceUsd.toFixed(4)} USD</p>}
            </div>
            <div className={`flex items-center ${token.priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              {token.priceChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              <span className="font-medium">{Math.abs(token.priceChange).toFixed(1)}%</span>
            </div>
          </div>

          <Button
            className="w-full connect-wallet-btn"
            style={{
              background: "linear-gradient(135deg, #FF9800 0%, #FF5722 100%)",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
            }}
          >
            Buy
          </Button>
        </div>
      </div>
    </Link>
  )
}
