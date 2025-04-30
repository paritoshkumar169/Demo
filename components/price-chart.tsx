"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"

interface PriceHistoryPoint {
  time: number
  price: number
}

interface PriceChartProps {
  priceHistory?: PriceHistoryPoint[]
}

// Mock data for the chart if no price history is provided
const generateChartData = (days: number) => {
  const data = []
  const now = new Date()
  let price = 0.01

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Add some randomness to the price
    price = price * (1 + (Math.random() * 0.1 - 0.05))

    data.push({
      date: date.toLocaleDateString(),
      price: price,
    })
  }

  return data
}

const timeRanges = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
]

export function PriceChart({ priceHistory }: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState(timeRanges[0])

  // Use provided price history or generate mock data
  const data = priceHistory
    ? priceHistory.map((point) => ({
        date: new Date(point.time).toLocaleDateString(),
        price: point.price,
      }))
    : generateChartData(selectedRange.days)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.label}
              variant={selectedRange.label === range.label ? "default" : "outline"}
              size="sm"
              className={selectedRange.label === range.label ? "bg-neon-blue" : "border-white/10 text-gray-400"}
              onClick={() => setSelectedRange(range)}
            >
              {range.label}
            </Button>
          ))}
        </div>
        <div className="text-sm text-gray-400">
          <span className="font-medium">Volume:</span> 1,234 SOL
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              tickFormatter={(value) => value.toFixed(4)}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip
              formatter={(value: number) => [value.toFixed(6) + " SOL", "Price"]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "rgba(15, 17, 26, 0.9)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.5rem",
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#3b82f6", stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
