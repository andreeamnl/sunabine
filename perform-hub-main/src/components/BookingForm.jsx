"use client"

import { useState } from "react"
import { useAuthStore } from "../store/authStore"
import useBookingStore from "../store/bookingStore"

const BookingForm = ({ performer, selectedDate, selectedTimeSlot, onClose }) => {
  const { user, isAuthenticated } = useAuthStore()
  const { createBooking, isLoading, error, clearError } = useBookingStore()

  const [formData, setFormData] = useState({
    clientName: user?.name || "",
    clientEmail: user?.email || "",
    clientPhone: user?.phone || "",
    eventType: "",
    eventLocation: "",
    eventDetails: "",
    message: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.clientName) errors.clientName = "Name is required"
    if (!formData.clientEmail) errors.clientEmail = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) errors.clientEmail = "Email is invalid"

    if (!formData.clientPhone) errors.clientPhone = "Phone number is required"
    if (!formData.eventType) errors.eventType = "Event type is required"
    if (!formData.eventLocation) errors.eventLocation = "Event location is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const bookingData = {
        performerId: performer._id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        ...formData,
      }

      await createBooking(bookingData)
      setBookingSuccess(true)
    } catch (err) {
      console.error("Booking failed:", err)
      // If the error is about the slot being already booked, show a specific message
      if (err.message && err.message.includes("already booked")) {
        alert("This time slot has just been booked by someone else. Please select another time slot.")
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ""

    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (bookingSuccess) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Successful!</h3>
          <p className="text-gray-600">
            Your booking request has been sent to {performer.name}. You'll receive a confirmation once they approve your
            request.
          </p>
        </div>

        <div className="bg-gray-50 rounded-md p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{formatDate(selectedDate)}</span>
          </div>
          {selectedTimeSlot && (
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">
                {formatTime(selectedTimeSlot.start)} - {formatTime(selectedTimeSlot.end)}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:bg-[hsl(var(--primary-dark))] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">Book {performer.name}</h3>

      <div className="bg-[hsl(var(--muted))] rounded-md p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-[hsl(var(--muted-foreground))]">Date:</span>
          <span className="font-medium">{formatDate(selectedDate)}</span>
        </div>
        {selectedTimeSlot && (
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Time:</span>
            <span className="font-medium">
              {formatTime(selectedTimeSlot.start)} - {formatTime(selectedTimeSlot.end)}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button className="text-xs text-red-600 underline mt-1" onClick={clearError}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
              Nume <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className={`input w-full ${formErrors.clientName ? "border-red-500" : ""}`}
              placeholder="Enter your full name"
            />
            {formErrors.clientName && <p className="mt-1 text-sm text-red-600">{formErrors.clientName}</p>}
          </div>

          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              className={`input w-full ${formErrors.clientEmail ? "border-red-500" : ""}`}
              placeholder="your@email.com"
            />
            {formErrors.clientEmail && <p className="mt-1 text-sm text-red-600">{formErrors.clientEmail}</p>}
          </div>

          <div>
            <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className={`input w-full ${formErrors.clientPhone ? "border-red-500" : ""}`}
              placeholder="(123) 456-7890"
            />
            {formErrors.clientPhone && <p className="mt-1 text-sm text-red-600">{formErrors.clientPhone}</p>}
          </div>

          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
              Tip Eveniment <span className="text-red-500">*</span>
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className={`input w-full ${formErrors.eventType ? "border-red-500" : ""}`}
            >
              <option value="">Select event type</option>
              <option value="Wedding">Wedding</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Birthday Party">Birthday Party</option>
              <option value="Concert">Concert</option>
              <option value="Festival">Festival</option>
              <option value="Private Party">Private Party</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.eventType && <p className="mt-1 text-sm text-red-600">{formErrors.eventType}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-700 mb-1">
          Locația evenimentului
          <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="eventLocation"
            name="eventLocation"
            value={formData.eventLocation}
            onChange={handleChange}
            className={`input w-full ${formErrors.eventLocation ? "border-red-500" : ""}`}
            placeholder="Enter the venue address"
          />
          {formErrors.eventLocation && <p className="mt-1 text-sm text-red-600">{formErrors.eventLocation}</p>}
        </div>

        <div>
          <label htmlFor="eventDetails" className="block text-sm font-medium text-gray-700 mb-1">
            Detalii Eveniment
          </label>
          <textarea
            id="eventDetails"
            name="eventDetails"
            value={formData.eventDetails}
            onChange={handleChange}
            rows={3}
            className="input w-full"
            placeholder="Describe your event and any specific requirements"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Mesaj pentru artist
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={2}
            className="input w-full"
            placeholder="Any additional information you'd like to share"
          />
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:bg-[hsl(var(--primary-dark))] transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Trimite"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookingForm
