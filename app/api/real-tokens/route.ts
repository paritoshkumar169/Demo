import { NextResponse } from "next/server"

// Token addresses and DexScreener pair addresses
const REAL_TOKENS = {
  WIF: {
    name: "Dogwifhat",
    ticker: "WIF",
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    pairAddress: "ep2ib6dydeeqd8mfe2ezhcxx3kp3k2elkkirfpm5eymx",
    image: "https://assets.coingecko.com/coins/images/33258/small/wif.png",
    description: "The original dog with a hat meme token on Solana.",
  },
  POPCAT: {
    name: "Popcat",
    ticker: "POPCAT",
    address: "8UaGbxQbKPyz5a8Nf1f3MxVWNcpLjGkNx5xGQGGQAVPP",
    pairAddress: "frhb8l7y9qq41qzxyltc2nw8an1rjfllxrf2x9rwllmo",
    image: "https://assets.coingecko.com/coins/images/33154/small/popcat.png",
    description: "Popcat is a meme token inspired by the viral Popcat meme.",
  },
  FART: {
    name: "Fartcoin",
    ticker: "FART",
    address: "FARTnTqKxcRjMJj4YQh3rBRNhUYwGJK5pxQTQCK9eTfo",
    pairAddress: "bzc9nzfmqkxr6fz1dbph7bdf9broyef6pnzesp7v5iiw",
    image: "https://assets.coingecko.com/coins/images/33693/small/fart.png",
    description: "A humorous meme token on Solana that's making noise in the crypto space.",
  },
}

// Cache control - 30 seconds
const CACHE_CONTROL = "public, s-maxage=30, stale-while-revalidate=60"

export async function GET() {
  try {
    const tokens = await Promise.all(
      Object.values(REAL_TOKENS).map(async (token) => {
        try {
          // Fetch data from DexScreener API
          const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${token.pairAddress}`, {
            headers: {
              Accept: "application/json",
            },
            next: { revalidate: 30 }, // Revalidate every 30 seconds
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch ${token.ticker} data: ${response.statusText}`)
          }

          const data = await response.json()
          const pair = data.pairs?.[0]

          if (!pair) {
            throw new Error(`No pair data found for ${token.ticker}`)
          }

          // Calculate 24h price change
          const priceChange = Number.parseFloat(pair.priceChange.h24) || 0

          // Get current timestamp
          const now = Date.now()

          // Generate price history (simulated based on current price)
          const basePrice = Number.parseFloat(pair.priceUsd)
          const priceHistory = Array.from({ length: 24 }, (_, i) => {
            // More recent hours are closer to current price
            // Earlier hours have more variance
            const hourFactor = (24 - i) / 24
            const variance = (Math.random() * 0.1 - 0.05) * hourFactor
            const historicalPrice = basePrice * (1 + variance - (priceChange / 100) * hourFactor)

            return {
              time: now - i * 3600000, // 1 hour intervals
              price: historicalPrice / 1000, // Convert to SOL (approximation)
            }
          }).reverse()

          // Format the token data
          return {
            id: token.address,
            name: token.name,
            ticker: token.ticker,
            image: token.image,
            price: Number.parseFloat(pair.priceUsd) / 1000, // Convert USD to SOL (approximation)
            priceChange: priceChange,
            priceUsd: Number.parseFloat(pair.priceUsd),
            volume24h: Number.parseFloat(pair.volume.h24),
            liquidity: Number.parseFloat(pair.liquidity.usd),
            hasSellWindow: Math.random() > 0.7, // Randomly determine if sell window is open
            createdAt: now - Math.floor(Math.random() * 30) * 86400000, // Random creation date within last 30 days
            description: token.description,
            priceHistory,
            holders: [
              {
                address: "11111...11111",
                username: "whale_wallet",
                holdingSince: Math.floor(Math.random() * 30) + 1,
                amount: Math.floor(Math.random() * 1000000) + 500000,
              },
              {
                address: "22222...22222",
                username: "diamond_hands",
                holdingSince: Math.floor(Math.random() * 20) + 1,
                amount: Math.floor(Math.random() * 500000) + 100000,
              },
              {
                address: "33333...33333",
                username: "early_investor",
                holdingSince: Math.floor(Math.random() * 15) + 1,
                amount: Math.floor(Math.random() * 100000) + 50000,
              },
              {
                address: "44444...44444",
                username: "meme_lover",
                holdingSince: Math.floor(Math.random() * 10) + 1,
                amount: Math.floor(Math.random() * 50000) + 10000,
              },
              {
                address: "55555...55555",
                username: "paper_hands",
                holdingSince: Math.floor(Math.random() * 5) + 1,
                amount: Math.floor(Math.random() * 10000) + 1000,
              },
            ],
          }
        } catch (error) {
          console.error(`Error fetching data for ${token.ticker}:`, error)
          // Return fallback data if API fails
          return {
            id: token.address,
            name: token.name,
            ticker: token.ticker,
            image: token.image,
            price: 0.001,
            priceChange: 0,
            hasSellWindow: false,
            createdAt: Date.now() - 86400000 * 10,
            description: token.description,
          }
        }
      }),
    )

    return NextResponse.json({ tokens }, { headers: { "Cache-Control": CACHE_CONTROL } })
  } catch (error) {
    console.error("Error fetching real tokens:", error)
    return NextResponse.json({ error: "Failed to fetch token data" }, { status: 500 })
  }
}
