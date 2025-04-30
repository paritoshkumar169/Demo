"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data
const GLOBAL_LEADERS = [
  { rank: 1, address: "11111...11111", username: "meteor_fan", days: 14, amount: 2500 },
  { rank: 2, address: "22222...22222", username: "solana_whale", days: 12, amount: 1850 },
  { rank: 3, address: "33333...33333", username: "token_collector", days: 10, amount: 1200 },
  { rank: 4, address: "44444...44444", username: "crypto_trader", days: 8, amount: 950 },
  { rank: 5, address: "55555...55555", username: "nft_lover", days: 7, amount: 820 },
  { rank: 6, address: "66666...66666", username: "defi_degen", days: 6, amount: 750 },
  { rank: 7, address: "77777...77777", username: "sol_maxi", days: 5, amount: 680 },
  { rank: 8, address: "88888...88888", username: "meme_lord", days: 4, amount: 520 },
  { rank: 9, address: "99999...99999", username: "diamond_hands", days: 3, amount: 450 },
  { rank: 10, address: "00000...00000", username: "paper_hands", days: 2, amount: 320 },
]

const TOKENS = [
  { id: "1", name: "Meteor Token", ticker: "MTEO" },
  { id: "2", name: "Dump Coin", ticker: "DUMP" },
  { id: "3", name: "Solana Meme", ticker: "SMEME" },
  { id: "4", name: "Pump Token", ticker: "PUMP" },
]

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"global" | "token">("global")
  const [selectedToken, setSelectedToken] = useState<string>(TOKENS[0].id)

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
      <p className="text-gray-400 mb-8">Top holders across all tokens</p>

      <div className="bg-tokyo-darkBlue border border-white/5 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "global" ? "default" : "outline"}
              onClick={() => setActiveTab("global")}
              className={activeTab === "global" ? "bg-neon-blue" : "border-white/10 text-gray-400"}
            >
              Global
            </Button>
            <Button
              variant={activeTab === "token" ? "default" : "outline"}
              onClick={() => setActiveTab("token")}
              className={activeTab === "token" ? "bg-neon-blue" : "border-white/10 text-gray-400"}
            >
              Per Token
            </Button>
          </div>

          {activeTab === "token" && (
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="w-[180px] bg-tokyo-gray/50 border-white/10">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="bg-tokyo-gray border-white/10">
                {TOKENS.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    {token.name} (${token.ticker})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="text-sm text-center mb-4 text-gray-400">
          {activeTab === "global" ? (
            <p>Showing longest total holding across all tokens</p>
          ) : (
            <p>Showing top holders for {TOKENS.find((t) => t.id === selectedToken)?.name}</p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Days Held</th>
                <th className="text-right py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {GLOBAL_LEADERS.map((leader, index) => (
                <tr key={leader.address} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    {index === 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500">
                        👑
                      </span>
                    ) : index === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-400/20 text-gray-400">
                        #2
                      </span>
                    ) : index === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-700">
                        #3
                      </span>
                    ) : (
                      `#${index + 1}`
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neon-blue-gradient flex items-center justify-center text-white font-bold">
                        {leader.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{leader.username}</p>
                        <p className="text-xs text-gray-400">{leader.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {leader.days} {leader.days === 1 ? "day" : "days"}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {leader.amount.toLocaleString()}{" "}
                    {activeTab === "token" ? TOKENS.find((t) => t.id === selectedToken)?.ticker : "tokens"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-center text-gray-400">
          <p>Leaderboard resets on sell or transfer</p>
        </div>
      </div>
    </div>
  )
}
