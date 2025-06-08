"use client"

import { useState } from "react"

const Calendar = ({ availableDates = [], onDateClick, selectedDate, selectionMode = "view" }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getMonthData = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay()

    // Total days in the month
    const daysInMonth = lastDay.getDate()

    // Create array for calendar days
    const days = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  // Format date as YYYY-MM-DD string
  const formatDateString = (date) => {
    if (!date) return null
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const isDateAvailable = (date) => {
    if (!date || !availableDates || availableDates.length === 0) return false

    const dateString = formatDateString(date)

    return availableDates.some((availableDate) => {
      // Handle both string dates and object dates with a date property
      const availableDateStr = typeof availableDate === "string" ? availableDate : availableDate.date

      return availableDateStr === dateString
    })
  }

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false

    const dateString = formatDateString(date)

    if (Array.isArray(selectedDate)) {
      return selectedDate.some((selected) => {
        const selectedStr = typeof selected === "string" ? selected : selected.date

        return selectedStr === dateString
      })
    }

    // Handle both string dates and Date objects
    if (typeof selectedDate === "string") {
      return selectedDate === dateString
    }

    // If selectedDate is a Date object
    return formatDateString(selectedDate) === dateString
  }

  const handleDateClick = (date) => {
    if (!date) return

    const dateString = formatDateString(date)

    if (selectionMode === "edit" || (selectionMode === "view" && isDateAvailable(date))) {
      onDateClick(dateString)
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const days = getMonthData(currentMonth)
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="calendar bg-[hsl(var(--card))] rounded-[var(--radius)] p-4 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Previous month"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Next month"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Weekday headers */}
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-[hsl(var(--muted-foreground))] py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day && (
              <button
                onClick={() => handleDateClick(day)}
                className={`w-full h-full flex items-center justify-center text-sm rounded-full transition-all ${
                  isDateSelected(day)
                    ? "bg-[hsl(var(--primary))] text-white shadow-md scale-105"
                    : isDateAvailable(day)
                      ? "bg-[hsl(var(--secondary))] bg-opacity-20 text-[#ffffff] hover:bg-opacity-30 cursor-pointer"
                      : selectionMode === "edit"
                        ? "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] cursor-pointer"
                        : "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] bg-opacity-30"
                }`}
                disabled={selectionMode === "view" && !isDateAvailable(day)}
              >
                {day.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        {selectionMode === "view" ? (
          <>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 rounded-full bg-[hsl(var(--secondary))] bg-opacity-20 mr-2"></span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Available</span>
            </div>

            <div className="flex items-center">
              <span className="inline-block w-4 h-4 rounded-full bg-[hsl(var(--primary))] mr-2"></span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Selected</span>
            </div>
          </>
        ) : (
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-[hsl(var(--primary))] mr-2"></span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">Selected Availability</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendar
