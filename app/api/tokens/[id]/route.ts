import { NextResponse } from "next/server"
import { Connection } from "@solana/web3.js"

// RPC connection for on-chain data
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com"

// In-memory token storage (in a real app, this would be a database)
// This is just for simulation - in a real app, we would fetch from a database
const tokens = [
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

// GET /api/tokens/[id] - Get a specific token
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const connection = new Connection(RPC_ENDPOINT, "confirmed")

    // Find token in our "database"
    const existingToken = tokens.find((t) => t.id === id)

    // In a real app, we would fetch the token from the blockchain
    // For now, we'll simulate fetching token data
    let token

    if (existingToken) {
      // Update with simulated on-chain data
      const newPrice = existingToken.price * (1 + (Math.random() * 0.1 - 0.05))
      const newPriceChange = existingToken.priceChange + (Math.random() * 2 - 1)

      // Simulate  * 0.1 - 0.05))

      // Simulate sell window based on time (15 min window every 6 hours)
      const now = Date.now()
      const hourOfDay = Math.floor((now % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
      const hasSellWindow = hourOfDay % 6 === 0 && now % (60 * 60 * 1000) < 15 * 60 * 1000

      // Generate price history for the chart
      const priceHistory = Array.from({ length: 24 }, (_, i) => {
        const time = Date.now() - i * 3600000
        const historyPrice = newPrice * (1 + ((Math.random() * 0.2 - 0.1) * (24 - i)) / 24)
        return { time, price: historyPrice }
      }).reverse()

      // Generate holders data
      const holders = [
        {
          address: "11111...11111",
          username: "meteor_fan",
          holdingSince: 3,
          amount: Math.floor(Math.random() * 1000) + 500,
        },
        {
          address: "22222...22222",
          username: "solana_whale",
          holdingSince: 2,
          amount: Math.floor(Math.random() * 800) + 300,
        },
        {
          address: "33333...33333",
          username: "token_collector",
          holdingSince: 1,
          amount: Math.floor(Math.random() * 500) + 200,
        },
        {
          address: "44444...44444",
          username: "crypto_trader",
          holdingSince: 1,
          amount: Math.floor(Math.random() * 300) + 100,
        },
        {
          address: "55555...55555",
          username: "nft_lover",
          holdingSince: 0,
          amount: Math.floor(Math.random() * 200) + 50,
        },
      ]

      token = {
        ...existingToken,
        price: newPrice,
        priceChange: newPriceChange,
        hasSellWindow,
        priceHistory,
        holders,
        volume: Math.floor(Math.random() * 10000),
      }
    } else {
      // If token not found in our database, create a simulated one based on the ID
      // In a real app, we would fetch the token data from the blockchain
      token = {
        id,
        name: `Token ${id.substring(0, 4)}`,
        ticker: `T${id.substring(0, 3)}`,
        image: "/placeholder.svg?height=80&width=80",
        price: 0.001 + Math.random() * 0.01,
        priceChange: Math.random() * 10 - 5,
        hasSellWindow: Math.random() > 0.8,
        createdAt: Date.now() - Math.floor(Math.random() * 7) * 86400000,
        description: "A newly created token on the Solana blockchain.",
        volume: Math.floor(Math.random() * 10000),
        holders: [
          {
            address: "11111...11111",
            username: "user1",
            holdingSince: 3,
            amount: Math.floor(Math.random() * 1000) + 100,
          },
          {
            address: "22222...22222",
            username: "user2",
            holdingSince: 2,
            amount: Math.floor(Math.random() * 800) + 100,
          },
          {
            address: "33333...33333",
            username: "user3",
            holdingSince: 1,
            amount: Math.floor(Math.random() * 500) + 100,
          },
        ],
        priceHistory: Array.from({ length: 24 }, (_, i) => ({
          time: Date.now() - i * 3600000,
          price: 0.001 + Math.random() * 0.01,
        })).reverse(),
      }
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error(`Error fetching token ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 })
  }
}

// PUT /api/tokens/[id] - Update a specific token (e.g., buy/sell)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { action, amount } = body

    // Validate required fields
    if (!action || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real app, we would update the token on the blockchain
    // For now, we'll simulate a successful transaction

    let price = 0.001 + Math.random() * 0.01
    let priceChange = 0

    if (action === "buy") {
      // Buying increases price
      priceChange = Math.random() * 5 + 0.5
      price = price * (1 + priceChange / 100)
    } else if (action === "sell") {
      // Selling decreases price
      priceChange = -(Math.random() * 5 + 0.5)
      price = price * (1 + priceChange / 100)
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: `tx_${Math.random().toString(36).substring(2, 10)}`,
        action,
        amount,
        price,
        priceChange,
        timestamp: Date.now(),
      },
    })
  } catch (error) {
    console.error(`Error updating token ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update token" }, { status: 500 })
  }
}
