"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriceChart } from "@/components/price-chart"
import { WalletModal } from "@/components/wallet-modal"
import { useTokens } from "@/context/token-context"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Connection } from "@solana/web3.js"
import { SendorService } from "@/services/sendor"

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com"

export default function TokenDetailPage() {
  const params = useParams()
  const tokenId = params.id as string
  const { getToken, buyToken, sellToken, refreshTokens } = useTokens()
  const { publicKey, connected, signTransaction } = useWallet()
  const { setVisible } = useWalletModal()

  const [token, setToken] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [buyAmount, setBuyAmount] = useState("")
  const [sellAmount, setSellAmount] = useState("")
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [userBalance, setUserBalance] = useState({ sol: 0, token: 0 })

  useEffect(() => {
    const fetchToken = async () => {
      setLoading(true)
      try {
        const tokenData = await getToken(tokenId)
        setToken(tokenData)

        // Fetch user balance if connected
        if (connected && publicKey) {
          try {
            const connection = new Connection(RPC_ENDPOINT, "confirmed")
            // Get SOL balance
            const solBalance = await connection.getBalance(publicKey)

            // In a real app, we would fetch the token balance from the blockchain
            // For now, simulate a token balance
            const tokenBalance = Math.floor(Math.random() * 1000) + 100

            setUserBalance({
              sol: solBalance / 1_000_000_000, // Convert lamports to SOL
              token: tokenBalance,
            })
          } catch (error) {
            console.error("Error fetching balances:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching token:", error)
      } finally {
        setLoading(false)
      }
    }

    if (tokenId) {
      fetchToken()

      // Set up polling for real-time updates
      const intervalId = setInterval(() => {
        fetchToken()
      }, 15000) // Update every 15 seconds

      return () => clearInterval(intervalId)
    }
  }, [tokenId, getToken, connected, publicKey])

  const handleBuy = async () => {
    if (!connected) {
      setVisible(true)
      return
    }

    if (!buyAmount || Number(buyAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      // In a real implementation, we would call the on-chain program
      if (publicKey && signTransaction && token) {
        const connection = new Connection(RPC_ENDPOINT, "confirmed")
        const wallet = { publicKey, signTransaction }
        const svc = new SendorService(connection, wallet as any)

        toast({
          title: "Transaction Initiated",
          description: "Please approve the transaction in your wallet",
        })

        // For now, just call the API to simulate
        const result = await buyToken(tokenId, Number(buyAmount))

        toast({
          title: "Purchase Successful",
          description: `You bought tokens for ${buyAmount} SOL`,
        })
        setBuyAmount("")

        // Refresh token data
        const updatedToken = await getToken(tokenId)
        setToken(updatedToken)
        await refreshTokens()

        // Update user balance
        setUserBalance((prev) => ({
          sol: prev.sol - Number(buyAmount),
          token: prev.token + Number(buyAmount) / token.price,
        }))
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSell = async () => {
    if (!connected) {
      setVisible(true)
      return
    }

    if (!sellAmount || Number(sellAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!token.hasSellWindow) {
      toast({
        title: "Sell Window Closed",
        description: "You can only sell during the sell window",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      // In a real implementation, we would call the on-chain program
      if (publicKey && signTransaction) {
        const connection = new Connection(RPC_ENDPOINT, "confirmed")
        const wallet = { publicKey, signTransaction }
        const svc = new SendorService(connection, wallet as any)

        toast({
          title: "Transaction Initiated",
          description: "Please approve the transaction in your wallet",
        })

        // For now, just call the API to simulate
        const result = await sellToken(tokenId, Number(sellAmount))

        toast({
          title: "Sale Successful",
          description: `You sold ${sellAmount} ${token.ticker} for SOL`,
        })
        setSellAmount("")

        // Refresh token data
        const updatedToken = await getToken(tokenId)
        setToken(updatedToken)
        await refreshTokens()

        // Update user balance
        setUserBalance((prev) => ({
          sol: prev.sol + Number(sellAmount) * token.price,
          token: prev.token - Number(sellAmount),
        }))
      }
    } catch (error) {
      toast({
        title: "Sale Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConnectWallet = () => {
    setIsWalletModalOpen(false)
    setVisible(true)
  }

  const estimatedCost = Number.parseFloat(buyAmount) * (token?.price || 0)
  const estimatedReturn = Number.parseFloat(sellAmount) * (token?.price || 0)

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="bg-tokyo-darkBlue border border-white/5 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div>
                  <Skeleton className="h-8 w-40 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
              <Skeleton className="h-32 rounded-xl mb-6" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="container px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Token not found</h1>
        <p className="text-gray-400 mb-6">The token you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <a href="/tokens">Back to Tokens</a>
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen ${token.hasSellWindow ? "bg-neon-red/5" : "bg-tokyo-black"} transition-all duration-500`}
    >
      {token.hasSellWindow && (
        <div className="w-full bg-neon-red/20 p-3 flex items-center justify-center gap-2 text-white">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-bold">SELL WINDOW OPEN</span>
          <span className="countdown ml-2">15:00 remaining</span>
        </div>
      )}

      <div className="container px-4 py-8">
        <div className="bg-tokyo-darkBlue border border-white/5 rounded-xl p-6 mb-8 transition-all duration-300 hover:shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Token Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src={token.image || "/placeholder.svg?height=80&width=80"}
                  alt={token.name}
                  width={80}
                  height={80}
                  className="rounded-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{token.name}</h1>
                    {token.isReal && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                  </div>
                  <p className="text-xl text-gray-400">${token.ticker}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-tokyo-gray/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Current Price</p>
                  <p className="text-2xl font-bold">{token.price.toFixed(4)} SOL</p>
                  {token.priceUsd && <p className="text-sm text-gray-400">${token.priceUsd.toFixed(4)} USD</p>}
                </div>
                <div className="bg-tokyo-gray/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400">24h Change</p>
                  <div className={`flex items-center ${token.priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {token.priceChange >= 0 ? (
                      <ArrowUpRight className="w-5 h-5 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 mr-1" />
                    )}
                    <span className="text-2xl font-bold">{Math.abs(token.priceChange).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {token.isReal && token.volume24h && token.liquidity && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-tokyo-gray/50 rounded-xl p-4">
                    <p className="text-sm text-gray-400">24h Volume</p>
                    <p className="text-lg font-bold">${token.volume24h.toLocaleString()}</p>
                  </div>
                  <div className="bg-tokyo-gray/50 rounded-xl p-4">
                    <p className="text-sm text-gray-400">Liquidity</p>
                    <p className="text-lg font-bold">${token.liquidity.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="bg-tokyo-gray/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">Description</p>
                <p>{token.description || "No description available."}</p>
              </div>

              {connected && (
                <div className="bg-tokyo-gray/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-400 mb-2">Your Balance</p>
                  <div className="flex justify-between">
                    <p>
                      <span className="font-medium">{userBalance.token.toFixed(2)}</span> {token.ticker}
                    </p>
                    <p>
                      <span className="font-medium">{userBalance.sol.toFixed(2)}</span> SOL
                    </p>
                  </div>
                </div>
              )}

              {token.hasSellWindow ? (
                <div className="bg-neon-red/10 rounded-xl p-4 border border-neon-red/30">
                  <div className="flex items-center gap-2 mb-4 text-neon-red-light">
                    <Clock className="h-5 w-5" />
                    <p className="font-medium">Sell window is currently open!</p>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    You can sell up to 10% of your holdings during this window.
                  </p>
                </div>
              ) : (
                <div className="bg-tokyo-gray/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5" />
                    <p className="font-medium">Next sell window in 6 hours</p>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Sell windows open for 15 minutes every 6 hours.</p>
                </div>
              )}
            </div>

            {/* Buy/Sell Panel */}
            <div className="bg-tokyo-gray/30 rounded-xl p-6">
              <Tabs defaultValue="buy">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-tokyo-gray">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-neon-blue data-[state=active]:text-white">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger
                    value="sell"
                    disabled={!token.hasSellWindow}
                    className="data-[state=active]:bg-neon-red data-[state=active]:text-white"
                  >
                    Sell {!token.hasSellWindow && <span className="ml-1 text-xs">(Closed)</span>}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="buy" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount to Buy (SOL)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      className="mb-2 bg-tokyo-black border-white/10"
                    />
                    <p className="text-sm text-gray-400">
                      Estimated tokens: {buyAmount ? (Number(buyAmount) / token.price).toFixed(4) : "0.0000"}{" "}
                      {token.ticker}
                    </p>
                    {connected && (
                      <p className="text-xs text-gray-400 mt-1">Your balance: {userBalance.sol.toFixed(4)} SOL</p>
                    )}
                  </div>

                  <Button
                    onClick={handleBuy}
                    className="w-full neon-blue-gradient"
                    disabled={!buyAmount || Number(buyAmount) <= 0 || isProcessing}
                  >
                    {isProcessing ? "Processing..." : connected ? "Buy Now" : "Connect Wallet to Buy"}
                  </Button>
                </TabsContent>

                <TabsContent value="sell" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount to Sell ({token.ticker})</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="mb-2 bg-tokyo-black border-white/10"
                    />
                    <p className="text-sm text-gray-400">Estimated return: {estimatedReturn.toFixed(4)} SOL</p>
                    {connected && (
                      <p className="text-xs text-gray-400 mt-1">
                        Your balance: {userBalance.token.toFixed(4)} {token.ticker}
                      </p>
                    )}
                    <p className="text-xs text-neon-red-light mt-2">
                      You can only sell up to 10% of your holdings during a sell window.
                    </p>
                  </div>

                  <Button
                    onClick={handleSell}
                    className="w-full neon-red-gradient"
                    disabled={!sellAmount || Number(sellAmount) <= 0 || isProcessing}
                  >
                    {isProcessing ? "Processing..." : connected ? "Sell Now" : "Connect Wallet to Sell"}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-tokyo-darkBlue border border-white/5 rounded-xl p-6 mb-8 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-xl font-bold mb-4">Price History</h2>
          <PriceChart priceHistory={token.priceHistory} />
        </div>

        {/* Holders Leaderboard */}
        <div className="bg-tokyo-darkBlue border border-white/5 rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-xl font-bold mb-4">Top Holders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Holding Since</th>
                  <th className="text-right py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {token.holders?.map((holder: any, index: number) => (
                  <tr key={holder.address} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">
                      {index === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-500/20 text-yellow-500 rounded-full">
                          👑
                        </span>
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neon-blue-gradient flex items-center justify-center text-white font-bold">
                          {holder.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{holder.username}</p>
                          <p className="text-xs text-gray-400">{holder.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {holder.holdingSince} {holder.holdingSince === 1 ? "day" : "days"}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {holder.amount.toLocaleString()} {token.ticker}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleConnectWallet}
      />
    </div>
  )
}
