import { NextResponse } from "next/server"
import { Connection } from "@solana/web3.js"

// In-memory token storage (in a real app, this would be a database)
let tokens = [
  {
    id: "1",
    name: "Meteor Token",
    ticker: "MTEO",
    image: "/images/logo.png",
    price: 0.0123,
    priceChange: 5.2,
    hasSellWindow: false,
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    description: "The official token for Sendor.Dump platform. Used for governance and platform fees.",
  },
  {
    id: "2",
    name: "Dump Coin",
    ticker: "DUMP",
    image: "/placeholder.svg?height=80&width=80",
    price: 0.0045,
    priceChange: -2.1,
    hasSellWindow: true,
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    description: "A memecoin for the Solana ecosystem with limited sell windows.",
  },
  {
    id: "3",
    name: "Solana Meme",
    ticker: "SMEME",
    image: "/placeholder.svg?height=80&width=80",
    price: 0.0078,
    priceChange: 12.5,
    hasSellWindow: false,
    createdAt: Date.now() - 86400000, // 1 day ago
    description: "The first meme token on Solana with a bonding curve mechanism.",
  },
]

// RPC connection for on-chain data
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com"

// GET /api/tokens - Get all tokens
export async function GET() {
  try {
    // In a real app, we would fetch tokens from the blockchain
    // For now, we'll just return the in-memory tokens with simulated price changes
    const connection = new Connection(RPC_ENDPOINT, "confirmed")

    // Update tokens with simulated on-chain data
    const updatedTokens = await Promise.all(
      tokens.map(async (token) => {
        try {
          // In a real implementation, we would fetch the actual on-chain data
          // For now, just simulate price changes
          const newPrice = token.price * (1 + (Math.random() * 0.1 - 0.05))
          const newPriceChange = token.priceChange + (Math.random() * 2 - 1)

          // Simulate sell window based on time (15 min window every 6 hours)
          const now = Date.now()
          const hourOfDay = Math.floor((now % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
          const hasSellWindow = hourOfDay % 6 === 0 && now % (60 * 60 * 1000) < 15 * 60 * 1000

          return {
            ...token,
            price: newPrice,
            priceChange: newPriceChange,
            hasSellWindow,
          }
        } catch (error) {
          console.error(`Error updating token ${token.id}:`, error)
          return token
        }
      }),
    )

    return NextResponse.json({ tokens: updatedTokens })
  } catch (error) {
    console.error("Error fetching tokens:", error)
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 })
  }
}

// POST /api/tokens - Create a new token
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, ticker, image, price, description, createdAt } = body

    // Validate required fields
    if (!id || !name || !ticker) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a new token
    const newToken = {
      id,
      name,
      ticker,
      image: image || "/placeholder.svg?height=80&width=80",
      price: price || 0.001,
      priceChange: 0,
      hasSellWindow: false,
      createdAt: createdAt || Date.now(),
      description: description || "",
    }

    // Add the token to our in-memory storage
    tokens = [newToken, ...tokens]

    return NextResponse.json({ token: newToken })
  } catch (error) {
    console.error("Error creating token:", error)
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 })
  }
}
