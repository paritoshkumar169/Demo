"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Upload, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token"
import type * as anchor from "@project-serum/anchor"
import { SendorService } from "@/services/sendor"
import { toast } from "@/components/ui/use-toast"
import { useTokens } from "@/context/token-context"

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com"
const BASE_PRICE_LAMPORTS = 100_000 // 0.0001 SOL
const SLOPE_LAMPORTS = 20 // 0.00000002 SOL

export default function CreateTokenPage() {
  const router = useRouter()
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const { addToken, refreshTokens } = useTokens()

  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    description: "",
    image: "/images/logo.png",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBuyPrompt, setShowBuyPrompt] = useState(false)
  const [mintAddress, setMintAddress] = useState<string | null>(null)
  const [mintKeypair, setMintKeypair] = useState<Keypair | null>(null)
  const [buyAmount, setBuyAmount] = useState("0.1")
  const [isBuying, setIsBuying] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [copied, setCopied] = useState(false)
  const [launchId, setLaunchId] = useState<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target
    if (name === "ticker") value = value.toUpperCase()
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
      setFormData((prev) => ({ ...prev, image: url }))
    }
  }

  // Fetch user balance when connected
  const fetchUserBalance = async () => {
    if (connected && publicKey) {
      try {
        const connection = new Connection(RPC_ENDPOINT, "confirmed")
        const balance = await connection.getBalance(publicKey)
        setUserBalance(balance / 1_000_000_000) // Convert lamports to SOL
      } catch (error) {
        console.error("Error fetching balance:", error)
      }
    }
  }

  // Fetch balance when component mounts or wallet connects
  useEffect(() => {
    fetchUserBalance()
  }, [connected, publicKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey || !signTransaction || !signAllTransactions) {
      setVisible(true)
      return
    }
    setIsSubmitting(true)
    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed")
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions,
      } as anchor.Wallet
      const svc = new SendorService(connection, wallet)

      // Generate mint keypair
      const newMintKeypair = Keypair.generate()
      setMintKeypair(newMintKeypair)

      // Create launch (handles mint & vault creation)
      await svc.createLaunch(newMintKeypair, BASE_PRICE_LAMPORTS, SLOPE_LAMPORTS)

      const newMint = newMintKeypair.publicKey.toString()
      console.log("Token Contract Address:", newMint)

      // Get the launch ID
      const [globalStatePda] = svc.findGlobalStatePDA()
      const gs = await svc.program.account.globalState.fetch(globalStatePda)
      const newLaunchId = (gs.launchCount as anchor.BN).toNumber() - 1
      setLaunchId(newLaunchId)

      // Add the token to our context and API
      const newToken = {
        id: newMint,
        name: formData.name,
        ticker: formData.ticker,
        image: imagePreview || formData.image,
        price: BASE_PRICE_LAMPORTS / 1_000_000_000,
        priceChange: 0,
        hasSellWindow: false,
        createdAt: Date.now(),
        description: formData.description,
      }

      await addToken(newToken)
      await refreshTokens() // Refresh tokens to make sure it appears in the list

      setMintAddress(newMint)
      setShowBuyPrompt(true)

      // Refresh balance after token creation
      await fetchUserBalance()

      toast({
        title: "Token Created Successfully",
        description: `Your token ${formData.ticker} has been created with address ${newMint.substring(0, 8)}...${newMint.substring(newMint.length - 8)}`,
      })
    } catch (err) {
      console.error("Error creating token launch:", err)
      toast({
        title: "Error Creating Token",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = () => {
    if (mintAddress) {
      navigator.clipboard.writeText(mintAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleBuySelf = async () => {
    if (!mintAddress || !publicKey || !signTransaction || launchId === null) {
      toast({
        title: "Error",
        description: "Missing required information for purchase",
        variant: "destructive",
      })
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

    // Check if user has enough balance
    if (Number(buyAmount) > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${userBalance.toFixed(4)} SOL available`,
        variant: "destructive",
      })
      return
    }

    setIsBuying(true)
    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed")
      const wallet = { publicKey, signTransaction } as anchor.Wallet
      const svc = new SendorService(connection, wallet)

      // Derive PDAs for this launch
      const [launchPda] = svc.findLaunchMetadataPDA(launchId)
      const [bondingPda] = svc.findBondingCurvePDA(launchId)

      const mintPubkey = new PublicKey(mintAddress)

      // 1️⃣ Pre-create buyer's ATA in its own transaction
      const buyerAta = await getAssociatedTokenAddress(
        mintPubkey,
        publicKey,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )

      try {
        const ataInfo = await connection.getAccountInfo(buyerAta)
        if (!ataInfo) {
          // ATA doesn't exist, create it
          const ataIx = createAssociatedTokenAccountInstruction(
            publicKey, // payer
            buyerAta,
            publicKey, // owner
            mintPubkey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
          )

          const ataTx = new Transaction().add(ataIx)
          ataTx.feePayer = publicKey
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed")
          ataTx.recentBlockhash = blockhash

          // Wallet signs ATA creation
          const signedAtaTx = await signTransaction(ataTx)
          const ataSig = await connection.sendRawTransaction(signedAtaTx.serialize())
          await connection.confirmTransaction({ signature: ataSig, blockhash, lastValidBlockHeight }, "confirmed")

          console.log("Created ATA:", ataSig)
        }
      } catch (error) {
        console.error("Error checking/creating ATA:", error)
      }

      // 2️⃣ Now invoke the buy CPI
      // Convert SOL amount to tokens based on price
      const solAmount = Number(buyAmount)
      const tokenAmount = solAmount / (BASE_PRICE_LAMPORTS / 1_000_000_000) // Estimate tokens based on base price

      console.log(`Buying ${tokenAmount} tokens for ${solAmount} SOL`)
      const txSignature = await svc.buy(launchPda, bondingPda, mintPubkey, tokenAmount)
      console.log("Buy transaction signature:", txSignature)

      toast({
        title: "Successfully bought your own token!",
        description: `You bought approximately ${tokenAmount.toFixed(2)} ${formData.ticker} tokens for ${buyAmount} SOL`,
      })

      // Update balance after purchase
      await fetchUserBalance()

      // Update token in context
      const updatedToken = {
        id: mintAddress,
        name: formData.name,
        ticker: formData.ticker,
        image: imagePreview || formData.image,
        price: (BASE_PRICE_LAMPORTS / 1_000_000_000) * 1.05, // Simulate price increase
        priceChange: 5.0,
        hasSellWindow: false,
        createdAt: Date.now(),
        description: formData.description,
      }

      await addToken(updatedToken)
      await refreshTokens()

      // Navigate to token page
      router.push(`/token/${mintAddress}`)
    } catch (err) {
      console.error("Error buying token:", err)
      toast({
        title: "Error Buying",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      })
    } finally {
      setIsBuying(false)
    }
  }

  const isFormValid =
    formData.name.length > 0 &&
    formData.name.length <= 20 &&
    formData.ticker.length >= 3 &&
    formData.ticker.length <= 6 &&
    formData.description.length > 0 &&
    formData.description.length <= 250

  if (showBuyPrompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 transition-all duration-500">
        <div className="bg-tokyo-darkBlue border border-white/5 rounded-xl p-8 max-w-md w-full transition-all duration-300 hover:shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-center">Token Deployed!</h1>
          <p className="text-center mb-6">Would you like to buy your own token to seed liquidity?</p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={imagePreview || formData.image}
                alt={formData.name}
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div>
                <h3 className="font-bold">{formData.name}</h3>
                <p className="text-sm text-gray-400">${formData.ticker}</p>
              </div>
            </div>

            {mintAddress && (
              <div className="bg-tokyo-gray/30 p-3 rounded-lg flex items-center justify-between mb-4">
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-400">Contract Address:</p>
                  <p className="text-sm font-mono truncate">{mintAddress}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="ml-2 hover:bg-white/10">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Buy (SOL)</label>
              <Input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="0.1"
                min="0.001"
                step="0.001"
                className="bg-tokyo-black border-white/10"
              />
              <div className="flex justify-between text-xs">
                <p className="text-gray-400">Minimum: 0.001 SOL</p>
                <p className="text-gray-400">Your balance: {userBalance.toFixed(4)} SOL</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleBuySelf}
              className="flex-1 connect-wallet-btn"
              disabled={isBuying || !buyAmount || Number(buyAmount) <= 0 || Number(buyAmount) > userBalance}
            >
              {isBuying ? "Processing..." : "Buy Now"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-white/10"
              onClick={() => router.push(`/token/${mintAddress}`)}
              disabled={isBuying}
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl px-4 py-8 transition-all duration-500">
      <div className="bg-tokyo-darkBlue border border-white/5 rounded-xl p-8 transition-all duration-300 hover:shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Create Token</h1>
        <p className="text-gray-400 mb-8">Launch your own token on Solana in minutes</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Token Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My Awesome Token"
              maxLength={20}
              className="bg-tokyo-black border-white/10"
            />
            <p className="text-xs text-gray-400">{formData.name.length}/20</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Token Ticker</label>
            <Input
              name="ticker"
              value={formData.ticker}
              onChange={handleInputChange}
              placeholder="TKN"
              maxLength={6}
              className="uppercase bg-tokyo-black border-white/10"
            />
            <p className="text-xs text-gray-400">3–6 characters</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your token..."
              maxLength={250}
              rows={4}
              className="bg-tokyo-black border-white/10"
            />
            <p className="text-xs text-gray-400">{formData.description.length}/250</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Token Image</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10">
                <Image src={imagePreview || formData.image} alt="Token preview" fill className="object-cover" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 hover:bg-white/5"
                onClick={handleImageUpload}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <p className="text-xs text-gray-400">512×512px PNG or JPG</p>
          </div>

          {connected && (
            <div className="bg-tokyo-gray/30 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Your balance: {userBalance.toFixed(4)} SOL</p>
            </div>
          )}

          <Button type="submit" className="w-full h-12 connect-wallet-btn" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? "Launching Token..." : "Launch Token"}
          </Button>
        </form>
      </div>
    </div>
  )
}
