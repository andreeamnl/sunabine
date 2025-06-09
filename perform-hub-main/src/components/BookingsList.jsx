"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "../store/authStore"
import useBookingStore from "../store/bookingStore"
import { format } from "date-fns"

const BookingsList = () => {
  const { user } = useAuthStore()
  const {
    bookings,
    isLoading,
    error,
    fetchClientBookings,
    fetchPerformerBookings,
    updateBookingStatus,
    cancelBooking,
  } = useBookingStore()

  const [activeTab, setActiveTab] = useState("upcoming")
  const [statusFilter, setStatusFilter] = useState("all")
  const [confirmAction, setConfirmAction] = useState(null)
  const [expandedBookingId, setExpandedBookingId] = useState(null)

  useEffect(() => {
    console.log("BookingsList component mounted, user:", user)
    if (user) {
      loadBookings()
    }

    // Reload bookings every 30 seconds to catch any updates
    const interval = setInterval(() => {
      if (user) {
        loadBookings()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  const loadBookings = async () => {
    if (!user) return

    try {
      console.log("Loading bookings for user:", user)
      console.log("User role:", user.role)
      console.log("Token exists:", !!localStorage.getItem("token"))

      if (user.role === "performer") {
        console.log("Fetching performer bookings")
        await fetchPerformerBookings()
      } else {
        console.log("Fetching client bookings")
        await fetchClientBookings()
      }
      console.log("Bookings loaded:", bookings)
    } catch (error) {
      console.error("Error loading bookings:", error)
      // If authentication error, you might want to redirect to login
      if (error.message === "Authentication required") {
        // Handle authentication error
        alert("Your session has expired. Please log in again.")
        // You could redirect to login page here if needed
      }
    }
  }

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status)
      setConfirmAction(null)
    } catch (error) {
      console.error("Failed to update booking status:", error)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId)
      setConfirmAction(null)
    } catch (error) {
      console.error("Failed to cancel booking:", error)
    }
  }

  const toggleExpand = (bookingId) => {
    setExpandedBookingId(expandedBookingId === bookingId ? null : bookingId)
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "EEE, MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ""

    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "canceled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isUpcoming = (booking) => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookingDate >= today && booking.status !== "canceled" && booking.status !== "rejected"
  }

  const isPast = (booking) => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookingDate < today || booking.status === "canceled" || booking.status === "rejected"
  }

  const filteredBookings = bookings.filter((booking) => {
    // First filter by tab (upcoming/past)
    if (activeTab === "upcoming" && !isUpcoming(booking)) return false
    if (activeTab === "past" && !isPast(booking)) return false

    // Then filter by status if a specific status is selected
    if (statusFilter !== "all" && booking.status !== statusFilter) return false

    return true
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-[hsl(var(--primary))] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[hsl(var(--primary))] rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-[hsl(var(--primary))] rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
          {user?.role === "performer" ? "Rezervările tale" : "Rezervările tale"}
        </h2>
        <p className="text-[hsl(var(--muted-foreground))]">
          {user?.role === "performer"
            ? "Administrează rezervările primite"
            : "Vezi programările tale cu artiști"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "upcoming"
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted-foreground))] hover:bg-opacity-10"
            }`}
          >
            În curs
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "past"
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted-foreground))] hover:bg-opacity-10"
            }`}
          >
            Trecute
          </button>
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
          >
            <option value="all">Toate statusurile</option>
            <option value="pending">În așteptare</option>
            <option value="confirmed">Confirmate</option>
            <option value="rejected">Respinse</option>
            <option value="canceled">Anulate</option>

          </select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center p-8 bg-[hsl(var(--muted))] rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))]"
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
          <h3 className="mt-2 text-lg font-medium">Nu există rezervări</h3>
          <p className="mt-1 text-[hsl(var(--muted-foreground))]">
            {activeTab === "upcoming" ? "Nu ai nicio rezervare viitoare." : "Nu ai nicio rezervare trecută."}
          </p>
          <button
            onClick={loadBookings}
            className="mt-4 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:bg-opacity-90"
          >
            Reîncarcă rezervările
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          booking.status,
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">Booking ID: {booking._id.substring(0, 8)}</span>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {user?.role === "performer" ? booking.clientName : booking.performer?.name || "Performer"}
                    </h3>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(booking.date)}</span>
                      </div>

                      <div className="flex items-center">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {formatTime(booking.timeSlot.start)} - {formatTime(booking.timeSlot.end)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{booking.eventLocation}</span>
                      </div>

                      <div className="flex items-center">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <span>{booking.eventType}</span>
                      </div>
                    </div>

                    <button
                      className="mt-3 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] transition-colors"
                      onClick={() => toggleExpand(booking._id)}
                    >
                      {expandedBookingId === booking._id ? "Hide Details" : "View Details"}
                    </button>

                    {expandedBookingId === booking._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {booking.eventDetails && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Event Details:</h4>
                            <p className="mt-1 text-sm text-gray-600">{booking.eventDetails}</p>
                          </div>
                        )}

                        {booking.message && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Message:</h4>
                            <p className="mt-1 text-sm text-gray-600">{booking.message}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Contact Information:</h4>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span>
                                {user?.role === "performer" ? booking.clientEmail : booking.performer?.email || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span>{user?.role === "performer" ? booking.clientPhone : "Contact via email"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                    {user?.role === "performer" && booking.status === "pending" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setConfirmAction({ type: "confirm", id: booking._id })}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: "reject", id: booking._id })}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))]"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {user?.role === "client" && booking.status === "pending" && (
                      <button
                        onClick={() => setConfirmAction({ type: "cancel", id: booking._id })}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))]"
                      >
                        Cancel Request
                      </button>
                    )}

                    {user?.role === "client" && booking.status === "confirmed" && (
                      <div>
                        <div className="flex items-center text-green-600">
                          <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium">Booking Confirmed</span>
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => setConfirmAction({ type: "cancel", id: booking._id })}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))]"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {confirmAction.type === "confirm"
                ? "Confirm Booking"
                : confirmAction.type === "reject"
                  ? "Reject Booking"
                  : "Cancel Booking"}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction.type === "confirm"
                ? "Are you sure you want to confirm this booking? This will notify the client that their booking has been accepted."
                : confirmAction.type === "reject"
                  ? "Are you sure you want to reject this booking? This will notify the client that their booking has been declined."
                  : "Are you sure you want to cancel this booking? This action cannot be undone."}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                No, Go Back
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === "confirm") {
                    handleStatusUpdate(confirmAction.id, "confirmed")
                  } else if (confirmAction.type === "reject") {
                    handleStatusUpdate(confirmAction.id, "rejected")
                  } else if (confirmAction.type === "cancel") {
                    handleCancelBooking(confirmAction.id)
                  }
                }}
                className={`px-4 py-2 rounded-md text-white ${
                  confirmAction.type === "confirm" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Yes,{" "}
                {confirmAction.type === "confirm" ? "Confirm" : confirmAction.type === "reject" ? "Reject" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingsList
