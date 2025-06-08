"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { usePerformerStore } from "../store/performerStore"
import { useAuthStore } from "../store/authStore"
import useBookingStore from "../store/bookingStore"
import MediaGallery from "../components/MediaGallery"
import BookingForm from "../components/BookingForm"

const PerformerProfile = () => {
  const { id } = useParams()
  const { currentPerformer, fetchPerformerById, isLoading } = usePerformerStore()
  const { isAuthenticated, user } = useAuthStore()
  const { checkTimeSlotAvailability } = useBookingStore()

  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [
    /* Remove the `checkingAvailability` state and related code: */
  ] = useState({})

  useEffect(() => {
    if (id) {
      fetchPerformerById(id)
    }
  }, [id, fetchPerformerById])

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
    setShowBookingForm(false)
    setShowContactInfo(false)
  }

  const handleTimeSlotSelect = async (timeSlot) => {
    // Simply select the time slot without checking availability
    // We'll check availability when submitting the booking
    setSelectedTimeSlot(timeSlot)
    setShowBookingForm(false)
    setShowContactInfo(false)
  }

  const handleBookClick = () => {
    if (!isAuthenticated) {
      // If not authenticated, show contact info instead of booking form
      setShowContactInfo(true)
    } else {
      setShowBookingForm(true)
    }
  }

  const formatTimeForDisplay = (time) => {
    if (!time) return ""

    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      const options = { weekday: "short", month: "short", day: "numeric" }
      return date.toLocaleDateString("en-US", options)
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Process and format availability data for display
  const processAvailabilityData = () => {
    if (!currentPerformer) return []

    // Check if availability exists and is not empty
    if (
      !currentPerformer.availability ||
      !Array.isArray(currentPerformer.availability) ||
      currentPerformer.availability.length === 0
    ) {
      return []
    }

    try {
      return currentPerformer.availability
        .map((item) => {
          // If item is a string (old format), convert to object
          if (typeof item === "string") {
            return { date: item, timeSlots: [] }
          }

          // If item is already an object with date and timeSlots
          if (item && typeof item === "object" && item.date) {
            return item
          }

          // If we can't determine the format, log it and return null
          console.error("Unknown availability format:", item)
          return null
        })
        .filter(Boolean) // Remove any null items
    } catch (error) {
      console.error("Error processing availability data:", error)
      return []
    }
  }

  const sortedAvailabilityData = () => {
    const availabilityData = processAvailabilityData()
    if (!availabilityData || availabilityData.length === 0) return []

    try {
      let filteredData = [...availabilityData]

      // Filter for upcoming dates if the toggle is on
      if (showOnlyUpcoming) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        filteredData = filteredData.filter((item) => {
          if (!item || !item.date) return false
          const itemDate = new Date(item.date)
          return itemDate >= today
        })
      }

      // Sort chronologically
      return filteredData.sort((a, b) => {
        if (!a || !a.date || !b || !b.date) return 0
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA - dateB
      })
    } catch (error) {
      console.error("Error sorting availability data:", error)
      return []
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[hsl(var(--primary))] animate-pulse"></div>
          <div className="w-4 h-4 rounded-full bg-[hsl(var(--secondary))] animate-pulse delay-150"></div>
          <div className="w-4 h-4 rounded-full bg-[hsl(var(--accent))] animate-pulse delay-300"></div>
        </div>
        <p className="mt-4 text-[hsl(var(--muted-foreground))]">Loading performer profile...</p>
      </div>
    )
  }

  if (!currentPerformer) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="card p-12">
          <svg
            className="h-16 w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xl font-medium text-red-500 mb-2">Performer not found</p>
          <p className="text-[hsl(var(--muted-foreground))]">
            The performer you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  const availabilityData = processAvailabilityData()
  const sorted = sortedAvailabilityData()

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="card overflow-hidden">
        {/* Header/Banner */}
        <div className="relative h-80 w-full overflow-hidden">
          <img
            src={currentPerformer.bannerImage || "/placeholder.svg?height=400&width=1200&query=music+stage+banner"}
            alt={`${currentPerformer.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end">
              <div className="mr-6">
                <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <img
                    src={
                      currentPerformer.profileImage || "/placeholder.svg?height=200&width=200&query=musician+portrait"
                    }
                    alt={currentPerformer.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{currentPerformer.name}</h1>
                <div className="flex items-center mt-2">
                  <span className="badge badge-primary mr-2">{currentPerformer.genre}</span>
                  <span className="text-sm text-white/80">{currentPerformer.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Left Column - Info */}
          <div className="lg:col-span-1">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
                About
              </h2>
              <p className="text-[hsl(var(--foreground))]">{currentPerformer.bio}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
                Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-[hsl(var(--muted-foreground))] w-24">Genre:</span>
                  <span className="font-medium">{currentPerformer.genre}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[hsl(var(--muted-foreground))] w-24">Location:</span>
                  <span className="font-medium">{currentPerformer.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[hsl(var(--muted-foreground))] w-24">Performance:</span>
                  <span className="font-medium">{currentPerformer.performanceType || "Live Music"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[hsl(var(--muted-foreground))] w-24">Group Size:</span>
                  <span className="font-medium">{currentPerformer.groupSize || 1} members</span>
                </div>
              </div>
            </div>

            {/* Media Gallery */}
            <div>
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
                Media
              </h2>
              {currentPerformer.media && currentPerformer.media.length > 0 ? (
                <MediaGallery media={currentPerformer.media} />
              ) : (
                <div className="card p-8 text-center">
                  <svg
                    className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-[hsl(var(--muted-foreground))]">No media available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Availability */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
                Availability
              </h2>
              <div className="flex items-center">
                {availabilityData.length > 0 && (
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {availabilityData.length} {availabilityData.length === 1 ? "date" : "dates"} available
                  </span>
                )}
              </div>
            </div>

            {availabilityData.length > 0 && sorted.length > 0 ? (
              <>
                <div className="mb-6 card bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-opacity-10 p-6">
                  <h3 className="text-md font-medium text-white mb-3">Next Available:</h3>
                  {(() => {
                    const nextAvailable = sorted[0]

                    if (nextAvailable) {
                      return (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="font-medium text-white">{formatDateForDisplay(nextAvailable.date)}</div>
                          {nextAvailable.timeSlots && nextAvailable.timeSlots.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {nextAvailable.timeSlots.map((slot, idx) => (
                                <span key={idx} className="badge bg-white/20 text-white backdrop-blur-sm">
                                  {formatTimeForDisplay(slot.start)} - {formatTimeForDisplay(slot.end)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-white/80">Available all day</span>
                          )}
                          <button
                            onClick={() => handleDateClick(nextAvailable.date)}
                            className="sm:ml-auto btn-primary bg-white text-[hsl(var(--primary))] hover:bg-white/90"
                          >
                            Book this date
                          </button>
                        </div>
                      )
                    } else {
                      return <p className="text-white/80">No upcoming availability</p>
                    }
                  })()}
                </div>

                <div className="card p-6">
                  <div className="mb-6 flex justify-between items-center">
                    <h3 className="text-lg font-medium">Available Dates</h3>
                    <div className="flex items-center">
                      <label htmlFor="upcoming-toggle" className="text-sm text-[hsl(var(--muted-foreground))] mr-2">
                        Show only upcoming
                      </label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="upcoming-toggle"
                          checked={showOnlyUpcoming}
                          onChange={() => setShowOnlyUpcoming(!showOnlyUpcoming)}
                          className="sr-only"
                        />
                        <div className="block bg-[hsl(var(--muted))] w-10 h-6 rounded-full"></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            showOnlyUpcoming ? "transform translate-x-4" : ""
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {sorted.map((item) => (
                      <div
                        key={item.date}
                        className={`p-4 rounded-[var(--radius)] border transition-colors ${
                          selectedDate === item.date
                            ? "border-[hsl(var(--primary))] bg-red-500 bg-opacity-5"
                            : "border-[hsl(var(--border))]"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="font-medium text-lg">{formatDateForDisplay(item.date)}</div>
                          <button
                            onClick={() => handleDateClick(item.date)}
                            className="mt-2 sm:mt-0 text-sm font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors"
                          >
                            Select
                          </button>
                        </div>

                        <div className="mt-3">
                          <div className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                            Time Slots:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.timeSlots && item.timeSlots.length > 0 ? (
                              item.timeSlots.map((slot, idx) => {
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleTimeSlotSelect(slot)}
                                    className={`px-3 py-2 text-sm rounded-md border transition-all ${
                                      selectedTimeSlot === slot
                                        ? "bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]"
                                        : "bg-[hsl(var(--muted))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
                                    }`}
                                  >
                                    {formatTimeForDisplay(slot.start)} - {formatTimeForDisplay(slot.end)}
                                  </button>
                                )
                              })
                            ) : (
                              <span className="text-sm text-[hsl(var(--muted-foreground))]">Available all day</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedDate && (
                    <div className="mt-8 card p-6 border-[hsl(var(--primary))] border">
                      <h3 className="font-medium text-lg mb-4">
                        Selected Date:{" "}
                        <span className="text-[hsl(var(--primary))]">{formatDateForDisplay(selectedDate)}</span>
                      </h3>

                      {(() => {
                        const selectedItem = availabilityData.find((item) => item.date === selectedDate)
                        const timeSlots = selectedItem?.timeSlots || []

                        return timeSlots.length > 0 ? (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3">
                              Available Time Slots:
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {timeSlots.map((slot, index) => {
                                return (
                                  <button
                                    key={index}
                                    onClick={() => handleTimeSlotSelect(slot)}
                                    className={`px-3 py-2 text-sm rounded-md border transition-all ${
                                      selectedTimeSlot === slot
                                        ? "bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]"
                                        : "bg-[hsl(var(--muted))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
                                    }`}
                                  >
                                    {formatTimeForDisplay(slot.start)} - {formatTimeForDisplay(slot.end)}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-[hsl(var(--muted-foreground))]">Available all day</p>
                        )
                      })()}

                      {!showBookingForm && !showContactInfo ? (
                        <div className="mt-6">
                          <p className="text-[hsl(var(--muted-foreground))] mb-4">
                            {currentPerformer.name} is available on this date
                            {selectedTimeSlot
                              ? ` from ${formatTimeForDisplay(selectedTimeSlot.start)} to ${formatTimeForDisplay(selectedTimeSlot.end)}`
                              : ""}
                            . Would you like to book them for your event?
                          </p>
                          <button onClick={handleBookClick} className="btn-primary" disabled={!selectedTimeSlot}>
                            {selectedTimeSlot ? "Book Now" : "Select a Time Slot"}
                          </button>
                        </div>
                      ) : showContactInfo ? (
                        <div className="mt-6 p-4 bg-[hsl(var(--muted))] rounded-lg">
                          <h4 className="font-medium mb-3">Contact {currentPerformer.name} directly:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="text-[hsl(var(--muted-foreground))] w-20">Phone:</span>
                              <span className="font-medium">{currentPerformer.phone || "03044168480"}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-[hsl(var(--muted-foreground))] w-20">Email:</span>
                              <span className="font-medium">{currentPerformer.email || "m.hassnain32@gmail.com"}</span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => setShowContactInfo(false)}
                              className="text-sm text-[hsl(var(--primary))]"
                            >
                              Go back
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6">
                          <BookingForm
                            performer={currentPerformer}
                            selectedDate={selectedDate}
                            selectedTimeSlot={selectedTimeSlot}
                            onClose={() => setShowBookingForm(false)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="card p-12 text-center">
                <svg
                  className="h-16 w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium mb-2">No Availability Set</p>
                <p className="text-[hsl(var(--muted-foreground))] mb-2">
                  This performer hasn't set their availability yet.
                </p>
                <p className="text-[hsl(var(--muted-foreground))]">
                  Check back later or contact them directly for booking information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformerProfile
