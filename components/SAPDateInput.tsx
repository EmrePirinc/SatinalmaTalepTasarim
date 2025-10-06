"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"
import { parseSAPDate, formatToISO, formatFromISO } from "@/lib/sapDateParser"

interface SAPDateInputProps {
  value: string // DD/MM/YYYY veya YYYY-MM-DD formatında
  onChange: (value: string) => void // DD/MM/YYYY formatında döner
  className?: string
  placeholder?: string
}

export default function SAPDateInput({ value, onChange, className = "", placeholder = "DD/MM/YYYY veya SAP format" }: SAPDateInputProps) {
  const [textValue, setTextValue] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // value prop'u DD/MM/YYYY veya YYYY-MM-DD olabilir
  const displayValue = value ? (value.includes("-") ? formatFromISO(value) : value) : ""

  const handleTextBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue) {
      const parsedDate = parseSAPDate(inputValue)
      onChange(parsedDate)
      setTextValue("")
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value)
  }

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      // Modern tarayıcılar için showPicker kullan
      if ('showPicker' in dateInputRef.current) {
        dateInputRef.current.showPicker()
      } else {
        // Fallback: input'a tıkla
        dateInputRef.current.click()
      }
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value // YYYY-MM-DD
    if (isoDate) {
      const formattedDate = formatFromISO(isoDate)
      onChange(formattedDate)
    }
  }

  return (
    <div className="relative flex items-center gap-1">
      <Input
        type="text"
        value={textValue || displayValue}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        onFocus={() => setTextValue(displayValue)}
        placeholder={placeholder}
        className={className}
      />
      <input
        ref={dateInputRef}
        type="date"
        className="absolute left-0 top-0 opacity-0 w-0 h-0 -z-10"
        value={displayValue ? formatToISO(displayValue) : ""}
        onChange={handleDateChange}
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={handleCalendarClick}
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
        title="Takvimden seç"
      >
        <Calendar className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  )
}
