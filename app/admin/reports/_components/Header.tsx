"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/user-ui/DatePicker"
import { CalendarIcon, FilterIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import useScroll from "@/lib/useScroll"

const dateRangeOptions = [
  { label: "Bugün", value: "today" },
  { label: "Son 7 gün", value: "7d" },
  { label: "Son 30 gün", value: "30d" },
  { label: "Son 90 gün", value: "90d" },
  { label: "Bu yıl", value: "year" },
  { label: "Tüm zamanlar", value: "all" },
]

const expenseStatusOptions = [
  { label: "Tüm durumlar", value: "all" },
  { label: "Onaylı", value: "approved" },
  { label: "Beklemede", value: "pending" },
  { label: "Reddedildi", value: "rejected" },
]

export default function Header() {
  const scrolled = useScroll(10)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [rangeOption, setRangeOption] = useState("30d")
  const [expenseStatus, setExpenseStatus] = useState("all")
  
  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    // Custom range selected
    if (range) {
      setRangeOption("custom")
    }
  }
  
  // Handle range option change
  const handleRangeChange = (value: string) => {
    setRangeOption(value)
    // Clear custom date range if a preset is selected
    if (value !== "custom") {
      setDateRange(undefined)
    }
  }
  
  // Handle reset filters
  const handleResetFilters = () => {
    setRangeOption("30d")
    setExpenseStatus("all")
    setDateRange(undefined)
  }

  return (
    <header
      className={`sticky top-0 z-10 -mx-6 bg-white px-6 py-5 dark:bg-gray-950 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Raporlar</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={rangeOption} onValueChange={handleRangeChange}>
            <SelectTrigger className="gap-1.5 bg-white pr-10 dark:bg-gray-950">
              <CalendarIcon className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {rangeOption === "custom" && (
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="outline">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Durum</h4>
                  <Select value={expenseStatus} onValueChange={setExpenseStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseStatusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={handleResetFilters}
                >
                  Filtreleri Sıfırla
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
