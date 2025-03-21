"use client"

import React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface TransactionChartProps {
  className?: string
  yAxisWidth?: number
  showYAxis?: boolean
  type: "amount" | "count" | "category" | "merchant"
}

// Sample data for demonstration
const chartData = {
  amount: [
    { name: "Oca", value: 24000 },
    { name: "Şub", value: 22000 },
    { name: "Mar", value: 26000 },
    { name: "Nis", value: 25000 },
    { name: "May", value: 27000 },
    { name: "Haz", value: 24000 },
    { name: "Tem", value: 23000 },
    { name: "Ağu", value: 21000 },
    { name: "Eyl", value: 25000 },
    { name: "Eki", value: 28000 },
    { name: "Kas", value: 27000 },
    { name: "Ara", value: 29000 },
  ],
  count: [
    { name: "Oca", value: 45 },
    { name: "Şub", value: 42 },
    { name: "Mar", value: 48 },
    { name: "Nis", value: 46 },
    { name: "May", value: 50 },
    { name: "Haz", value: 45 },
    { name: "Tem", value: 43 },
    { name: "Ağu", value: 40 },
    { name: "Eyl", value: 47 },
    { name: "Eki", value: 52 },
    { name: "Kas", value: 50 },
    { name: "Ara", value: 55 },
  ],
  category: [
    { name: "Eğitim", value: 140 },
    { name: "Kitaplar", value: 85 },
    { name: "Barınma", value: 120 },
    { name: "Ulaşım", value: 65 },
    { name: "Yemek", value: 110 },
    { name: "Diğer", value: 40 },
  ],
  merchant: [
    { name: "Üniversite", value: 125 },
    { name: "Kitapçı", value: 75 },
    { name: "Yurt", value: 110 },
    { name: "Toplu Taşıma", value: 55 },
    { name: "Market", value: 90 },
    { name: "Diğer", value: 35 },
  ],
}

// Chart titles
const chartTitles = {
  amount: "Aylık Burs Ödemeleri (TL)",
  count: "Aylık Bursiyer Sayısı",
  category: "Kategori Bazında Harcamalar",
  merchant: "Kurum Bazında Harcamalar",
}

export function TransactionChart({ 
  type, 
  yAxisWidth = 40, 
  showYAxis = true,
  className = ""
}: TransactionChartProps) {
  const data = chartData[type]
  const title = chartTitles[type]
  
  // Format values for tooltip
  const formatValue = (value: number) => {
    if (type === "amount") {
      return `${value.toLocaleString('tr-TR')} ₺`
    }
    return value
  }

  return (
    <div className={className}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
        {title}
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            {showYAxis && (
              <YAxis 
                width={yAxisWidth}
                tickFormatter={(value) => type === "amount" ? `${value/1000}k` : value.toString()}
              />
            )}
            <XAxis dataKey="name" />
            <Tooltip 
              formatter={(value: number) => formatValue(value)}
              labelFormatter={(label) => `${label}`}
            />
            <Bar 
              dataKey="value" 
              fill="#6366f1" 
              radius={[4, 4, 0, 0]} 
              barSize={type === "category" || type === "merchant" ? 30 : undefined}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
