"use client"

import { useState } from "react"

const TimeSlotSelector = ({ selectedTimeSlots = [], onChange }) => {
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")

  const timeOptions = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0")
      const formattedMinute = minute.toString().padStart(2, "0")
      timeOptions.push(`${formattedHour}:${formattedMinute}`)
    }
  }

  const handleAddTimeSlot = () => {
    // Validate that start time is before end time
    if (startTime >= endTime) {
      alert("Start time must be before end time")
      return
    }

    // Check for overlapping time slots
    const isOverlapping = selectedTimeSlots.some(
      (slot) =>
        (startTime >= slot.start && startTime < slot.end) ||
        (endTime > slot.start && endTime <= slot.end) ||
        (startTime <= slot.start && endTime >= slot.end),
    )

    if (isOverlapping) {
      alert("This time slot overlaps with an existing time slot")
      return
    }

    const newTimeSlot = {
      start: startTime,
      end: endTime,
    }

    onChange([...selectedTimeSlots, newTimeSlot])
  }

  const handleRemoveTimeSlot = (index) => {
    const updatedTimeSlots = [...selectedTimeSlots]
    updatedTimeSlots.splice(index, 1)
    onChange(updatedTimeSlots)
  }

  const formatTimeForDisplay = (time) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="time-slot-selector">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="start-time" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Start Time
          </label>
          <select id="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input">
            {timeOptions.map((time) => (
              <option key={`start-${time}`} value={time}>
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="end-time" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            End Time
          </label>
          <select id="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input">
            {timeOptions.map((time) => (
              <option key={`end-${time}`} value={time}>
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={handleAddTimeSlot} className="btn-primary">
            Add Time Slot
          </button>
        </div>
      </div>

      {selectedTimeSlots.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-[hsl(var(--foreground))] mb-3">Selected Time Slots:</h4>
          <ul className="space-y-3">
            {selectedTimeSlots.map((slot, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 rounded-[calc(var(--radius)-0.25rem)] bg-[hsl(var(--muted))] border"
              >
                <span className="font-medium">
                  {formatTimeForDisplay(slot.start)} - {formatTimeForDisplay(slot.end)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTimeSlot(index)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors p-1 rounded-full hover:bg-[hsl(var(--background))]"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default TimeSlotSelector
