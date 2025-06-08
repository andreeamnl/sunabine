import { create } from "zustand"
import axios from "axios"



const useBookingStore = create((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,

  // Create a new booking
  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem("token")
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      }

      console.log("Creating booking with token:", token ? "Token exists" : "No token")
      const response = await axios.post(`http://localhost:8000/api/bookings`, bookingData, config)

      // Add the new booking to the store
      set((state) => ({
        bookings: [response.data.booking, ...state.bookings],
        isLoading: false,
      }))

      return response.data.booking
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create booking"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  // Fetch bookings for a client
  fetchClientBookings: async () => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      console.log("Fetching client bookings with token:", token ? "Token exists" : "No token")
      const response = await axios.get(`http://localhost:8000/api/bookings/client`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Client bookings response:", response.data)
      set({ bookings: response.data, isLoading: false })
      return response.data
    } catch (error) {
      console.error("Error fetching client bookings:", error)
      const errorMessage = error.response?.data?.message || "Failed to fetch bookings"
      set({ error: errorMessage, isLoading: false })
      return []
    }
  },

  // Fetch bookings for a performer
  fetchPerformerBookings: async () => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await axios.get(`http://localhost:8000/api/bookings/performer`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Performer bookings response:", response.data)
      set({ bookings: response.data, isLoading: false })
      return response.data
    } catch (error) {
      console.error("Error fetching performer bookings:", error)
      const errorMessage = error.response?.data?.message || "Failed to fetch bookings"
      set({ error: errorMessage, isLoading: false })
      return []
    }
  },

  // Update booking status (confirm/reject)
  updateBookingStatus: async (bookingId, status) => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await axios.put(
        `http://localhost:8000/api/bookings/${bookingId}/status`,
        { status },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update the booking in the store
      set((state) => ({
        bookings: state.bookings.map((booking) => (booking._id === bookingId ? { ...booking, status } : booking)),
        isLoading: false,
      }))

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update booking status"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await axios.put(
        `http://localhost:8000/api/bookings/${bookingId}/cancel`,
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update the booking in the store
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking._id === bookingId ? { ...booking, status: "canceled" } : booking,
        ),
        isLoading: false,
      }))

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to cancel booking"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  // Check if a time slot is already booked
  checkTimeSlotAvailability: async (performerId, date, timeSlot) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(
        `http://localhost:8000/api/bookings/availability?performerId=${performerId}&date=${date}&startTime=${timeSlot.start}&endTime=${timeSlot.end}`,
      )

      set({ isLoading: false })
      return response.data.available
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to check availability"
      set({ error: errorMessage, isLoading: false })
      return false
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}))

export default useBookingStore
