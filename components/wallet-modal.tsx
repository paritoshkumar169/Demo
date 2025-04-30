"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (address: string) => void
}

const WALLETS = [
  {
    name: "Phantom",
    icon: "/placeholder.svg?height=40&width=40",
    color: "#AB9FF2",
  },
  {
    name: "Solflare",
    icon: "/placeholder.svg?height=40&width=40",
    color: "#FC822B",
  },
]

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = (walletName: string) => {
    setIsConnecting(true)

    // Simulate connection
    setTimeout(() => {
      // Generate random wallet address
      const address = "11111" + Math.random().toString(36).substring(2, 10) + "11111"
      onConnect(address)
      setIsConnecting(false)
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-tokyo-darkBlue border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Connect Wallet</DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            You&apos;ll need a wallet to buy, sell, or launch tokens
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {WALLETS.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="flex items-center justify-start gap-3 h-14 px-4 border-white/10 hover:bg-white/5"
              disabled={isConnecting}
              onClick={() => handleConnect(wallet.name)}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: wallet.color }}
              >
                <Image src={wallet.icon || "/placeholder.svg"} alt={wallet.name} width={24} height={24} />
              </div>
              <span className="font-medium">{wallet.name}</span>
              {isConnecting && <span className="ml-auto animate-pulse">Connecting...</span>}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
