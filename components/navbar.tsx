"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"

export function Navbar() {
  const { setVisible } = useWalletModal()
  const { publicKey, disconnect } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleConnect = () => {
    setVisible(true)
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDropdown(false)
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-tokyo-black/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Sendor.Dump Logo" width={50} height={50} className="rounded-full" />
            <span className="text-xl font-bold">
              <span className="text-sendor-green">sendor</span>
              <span className="text-sendor-red">.dump</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-orange-400">
              Home
            </Link>
            <Link href="/tokens" className="text-sm font-medium hover:text-orange-400">
              Tokens
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium hover:text-orange-400">
              Leaderboard
            </Link>
            <Link href="/create" className="text-sm font-medium hover:text-orange-400">
              Create
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {publicKey ? (
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-orange-500/30 text-orange-400"
                onClick={toggleDropdown}
              >
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </Button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-tokyo-darkBlue rounded-md shadow-lg py-1 z-10 border border-white/5">
                  <Link href="/my-tokens" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
                    My Tokens
                  </Link>
                  <button
                    onClick={handleDisconnect}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              className="connect-wallet-btn"
              style={{
                background: "linear-gradient(135deg, #FF9800 0%, #FF5722 100%)",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
              }}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
