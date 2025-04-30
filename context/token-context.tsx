"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"

export interface Token {
  id: string
  name: string
  ticker: string
  image: string
  price: number
  priceChange: number
  hasSellWindow: boolean
  createdAt?: number
  description?: string
  priceUsd?: number
  volume24h?: number
  liquidity?: number
  isReal?: boolean
  priceHistory?: Array<{ time: number; price: number }>
  holders?: Array<{ address: string; username: string; holdingSince: number; amount: number }>
}

interface TokenContextType {
  tokens: Token[]
  loading: boolean
  addToken: (token: Token) => Promise<void>
  refreshTokens: () => Promise<void>
  getToken: (id: string) => Promise<any>
  buyToken: (id: string, amount: number) => Promise<any>
  sellToken: (id: string, amount: number) => Promise<any>
}

const TokenContext = createContext<TokenContextType>({
  tokens: [],
  loading: false,
  addToken: async () => {},
  refreshTokens: async () => {},
  getToken: async () => ({}),
  buyToken: async () => ({}),
  sellToken: async () => ({}),
})

export const useTokens = () => useContext(TokenContext)

// Create a local storage key for tokens
const LOCAL_STORAGE_KEY = "sendor_dump_tokens"

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const [tokens, setTokens] = useState<Token[]>([])
  const [realTokens, setRealTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const { publicKey, connected } = useWallet()
  const router = useRouter()

  // Load tokens from localStorage on initial mount
  useEffect(() => {
    const loadLocalTokens = () => {
      if (typeof window !== "undefined") {
        const savedTokens = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (savedTokens) {
          try {
            const parsedTokens = JSON.parse(savedTokens)
            setTokens(parsedTokens)
          } catch (error) {
            console.error("Error parsing local tokens:", error)
          }
        }
      }
    }

    loadLocalTokens()
  }, [])

  // Save tokens to localStorage whenever they change
  useEffect(() => {
    if (tokens.length > 0 && typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tokens))
    }
  }, [tokens])

  // Fetch real tokens
  const fetchRealTokens = useCallback(async () => {
    try {
      const response = await fetch("/api/real-tokens")
      if (!response.ok) {
        throw new Error("Failed to fetch real tokens")
      }
      const data = await response.json()
      const fetchedRealTokens = data.tokens.map((token: Token) => ({
        ...token,
        isReal: true,
      }))
      setRealTokens(fetchedRealTokens)
      return fetchedRealTokens
    } catch (error) {
      console.error("Error fetching real tokens:", error)
      return []
    }
  }, [])

  const addToken = useCallback(async (token: Token) => {
    try {
      // Add token to API
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(token),
      })

      if (!response.ok) {
        throw new Error("Failed to add token")
      }

      // Update local state
      setTokens((prev) => {
        // Check if token already exists
        const exists = prev.some((t) => t.id === token.id)
        if (exists) {
          return prev.map((t) => (t.id === token.id ? token : t))
        } else {
          return [token, ...prev]
        }
      })

      // Save to localStorage
      if (typeof window !== "undefined") {
        const currentTokens = localStorage.getItem(LOCAL_STORAGE_KEY)
        const parsedTokens = currentTokens ? JSON.parse(currentTokens) : []
        const exists = parsedTokens.some((t: Token) => t.id === token.id)

        if (exists) {
          const updatedTokens = parsedTokens.map((t: Token) => (t.id === token.id ? token : t))
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTokens))
        } else {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([token, ...parsedTokens]))
        }
      }
    } catch (error) {
      console.error("Error adding token:", error)
    }
  }, [])

  const refreshTokens = useCallback(async () => {
    setLoading(true)
    try {
      // First, get real tokens
      const fetchedRealTokens = await fetchRealTokens()

      // Then, get tokens from API
      const response = await fetch("/api/tokens")
      if (!response.ok) {
        throw new Error("Failed to fetch tokens")
      }

      const data = await response.json()
      const apiTokens = data.tokens || []

      // Then, get tokens from localStorage
      let localTokens: Token[] = []
      if (typeof window !== "undefined") {
        const savedTokens = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (savedTokens) {
          try {
            localTokens = JSON.parse(savedTokens)
          } catch (error) {
            console.error("Error parsing local tokens:", error)
          }
        }
      }

      // Merge all tokens, prioritizing real tokens, then local tokens, then API tokens
      const mergedTokens = [...fetchedRealTokens]

      // Add local tokens that don't exist in real tokens
      localTokens.forEach((localToken: Token) => {
        const exists = mergedTokens.some((t) => t.id === localToken.id)
        if (!exists) {
          mergedTokens.push(localToken)
        }
      })

      // Add API tokens that don't exist in real tokens or local tokens
      apiTokens.forEach((apiToken: Token) => {
        const exists = mergedTokens.some((t) => t.id === apiToken.id)
        if (!exists) {
          mergedTokens.push(apiToken)
        }
      })

      // Sort by creation date (newest first)
      mergedTokens.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

      setTokens(mergedTokens)
    } catch (error) {
      console.error("Error refreshing tokens:", error)
    } finally {
      setLoading(false)
    }
  }, [fetchRealTokens])

  const getToken = useCallback(
    async (id: string) => {
      try {
        // First check if it's a real token
        const realToken = realTokens.find((t) => t.id === id)
        if (realToken) {
          // Refresh real token data
          const response = await fetch("/api/real-tokens")
          if (response.ok) {
            const data = await response.json()
            const updatedRealToken = data.tokens.find((t: Token) => t.id === id)
            if (updatedRealToken) {
              return { ...updatedRealToken, isReal: true }
            }
          }
          return realToken
        }

        // Then check if we have the token locally
        const localToken = tokens.find((t) => t.id === id)

        // Try to get from API
        const response = await fetch(`/api/tokens/${id}`)
        if (!response.ok) {
          // If API fails but we have local token, return that
          if (localToken) {
            return {
              ...localToken,
              priceHistory: Array.from({ length: 24 }, (_, i) => ({
                time: Date.now() - i * 3600000,
                price: localToken.price * (1 + ((Math.random() * 0.2 - 0.1) * (24 - i)) / 24),
              })).reverse(),
              holders: [
                {
                  address: "11111...11111",
                  username: "creator",
                  holdingSince: 0,
                  amount: Math.floor(Math.random() * 1000) + 500,
                },
                {
                  address: "22222...22222",
                  username: "early_buyer",
                  holdingSince: 0,
                  amount: Math.floor(Math.random() * 800) + 300,
                },
              ],
            }
          }
          throw new Error("Failed to fetch token")
        }

        const data = await response.json()
        return data.token
      } catch (error) {
        console.error(`Error fetching token ${id}:`, error)
        return null
      }
    },
    [tokens, realTokens],
  )

  const buyToken = useCallback(
    async (id: string, amount: number) => {
      try {
        // Check if it's a real token
        const isRealToken = realTokens.some((t) => t.id === id)

        if (isRealToken) {
          // For real tokens, simulate a successful transaction
          // In a real app, this would call the actual blockchain
          await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate transaction time

          // Refresh real token data
          await fetchRealTokens()

          return {
            success: true,
            transaction: {
              id: `tx_${Math.random().toString(36).substring(2, 10)}`,
              action: "buy",
              amount,
              timestamp: Date.now(),
            },
          }
        }

        // For custom tokens, use the API
        const response = await fetch(`/api/tokens/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "buy",
            amount,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to buy token")
        }

        const data = await response.json()

        // Update token in local state with new price
        const token = tokens.find((t) => t.id === id)
        if (token) {
          const updatedToken = {
            ...token,
            price: token.price * (1 + Math.random() * 0.05), // Simulate price increase
            priceChange: token.priceChange + Math.random() * 2,
          }

          setTokens((prev) => prev.map((t) => (t.id === id ? updatedToken : t)))

          // Update in localStorage
          if (typeof window !== "undefined") {
            const savedTokens = localStorage.getItem(LOCAL_STORAGE_KEY)
            if (savedTokens) {
              const parsedTokens = JSON.parse(savedTokens)
              const updatedTokens = parsedTokens.map((t: Token) => (t.id === id ? updatedToken : t))
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTokens))
            }
          }
        }

        return data
      } catch (error) {
        console.error(`Error buying token ${id}:`, error)
        throw error
      }
    },
    [tokens, realTokens, fetchRealTokens],
  )

  const sellToken = useCallback(
    async (id: string, amount: number) => {
      try {
        // Check if it's a real token
        const isRealToken = realTokens.some((t) => t.id === id)

        if (isRealToken) {
          // For real tokens, simulate a successful transaction
          // In a real app, this would call the actual blockchain
          await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate transaction time

          // Refresh real token data
          await fetchRealTokens()

          return {
            success: true,
            transaction: {
              id: `tx_${Math.random().toString(36).substring(2, 10)}`,
              action: "sell",
              amount,
              timestamp: Date.now(),
            },
          }
        }

        // For custom tokens, use the API
        const response = await fetch(`/api/tokens/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "sell",
            amount,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to sell token")
        }

        const data = await response.json()

        // Update token in local state with new price
        const token = tokens.find((t) => t.id === id)
        if (token) {
          const updatedToken = {
            ...token,
            price: token.price * (1 - Math.random() * 0.05), // Simulate price decrease
            priceChange: token.priceChange - Math.random() * 2,
          }

          setTokens((prev) => prev.map((t) => (t.id === id ? updatedToken : t)))

          // Update in localStorage
          if (typeof window !== "undefined") {
            const savedTokens = localStorage.getItem(LOCAL_STORAGE_KEY)
            if (savedTokens) {
              const parsedTokens = JSON.parse(savedTokens)
              const updatedTokens = parsedTokens.map((t: Token) => (t.id === id ? updatedToken : t))
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTokens))
            }
          }
        }

        return data
      } catch (error) {
        console.error(`Error selling token ${id}:`, error)
        throw error
      }
    },
    [tokens, realTokens, fetchRealTokens],
  )

  // Initial fetch - only run once when component mounts
  useEffect(() => {
    refreshTokens()

    // Set up polling for real-time updates
    const intervalId = setInterval(() => {
      refreshTokens()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(intervalId)
  }, [refreshTokens])

  return (
    <TokenContext.Provider
      value={{
        tokens,
        loading,
        addToken,
        refreshTokens,
        getToken,
        buyToken,
        sellToken,
      }}
    >
      {children}
    </TokenContext.Provider>
  )
}
