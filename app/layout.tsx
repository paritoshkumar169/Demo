import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { WalletContextProvider } from "@/context/wallet-context"
import { TokenProvider } from "@/context/token-context"
import { Toaster } from "@/components/ui/toaster"
import { PageTransition } from "@/components/page-transition"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sendor.Dump | Solana Token Platform",
  description: "Launch, buy, and sell tokens on Solana with Sendor.Dump",
  generator: "v0.dev",
  icons: {
    icon: "/images/sendor-dump-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WalletContextProvider>
          <TokenProvider>
            <Navbar />
            <PageTransition>
              <main className="min-h-screen pt-16">{children}</main>
            </PageTransition>
            <Toaster />
          </TokenProvider>
        </WalletContextProvider>
      </body>
    </html>
  )
}
