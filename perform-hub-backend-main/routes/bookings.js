import express from "express"
import Booking from "../models/Booking.js"
import User from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Create a new booking
router.post("/", async (req, res) => {
  try {
    const {
      performerId,
      clientName,
      clientEmail,
      clientPhone,
      date,
      timeSlot,
      eventDetails,
      eventType,
      eventLocation,
      message,
    } = req.body

    // Check if performer exists
    const performer = await User.findById(performerId)
    if (!performer) {
      return res.status(404).json({ message: "Performer not found" })
    }

    // Check if the date and time slot are available
    const isDateAvailable = performer.availability.some((item) => {
      if (typeof item === "string") {
        return item === date
      }
      return item.date === date
    })

    if (!isDateAvailable) {
      return res.status(400).json({ message: "Selected date is not available" })
    }

    // If there are specific time slots, check if the selected time slot is available
    const availabilityItem = performer.availability.find((item) => {
      if (typeof item === "object" && item.date === date) {
        return item
      }
      return null
    })

    if (availabilityItem && availabilityItem.timeSlots && availabilityItem.timeSlots.length > 0) {
      const isTimeSlotAvailable = availabilityItem.timeSlots.some(
        (slot) => slot.start === timeSlot.start && slot.end === timeSlot.end,
      )

      if (!isTimeSlotAvailable) {
        return res.status(400).json({ message: "Selected time slot is not available" })
      }
    }

    // Check if there's already a booking for this date and time slot
    const existingBooking = await Booking.findOne({
      performer: performerId,
      date,
      "timeSlot.start": timeSlot.start,
      "timeSlot.end": timeSlot.end,
      status: { $in: ["pending", "confirmed"] },
    })

    if (existingBooking) {
      return res.status(400).json({ message: "This time slot is already booked" })
    }

    // Extract token from request
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1] || req.query.token
    let clientId = null

    // If token exists, decode it to get user ID
    if (token) {
      try {
        const jwt = await import("jsonwebtoken")
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "your-secret-key")
        clientId = decoded.id
        console.log("Decoded client ID from token:", clientId)
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }

    // Create new booking
    const booking = new Booking({
      performer: performerId,
      clientName,
      clientEmail,
      clientPhone,
      date,
      timeSlot,
      eventDetails,
      eventType,
      eventLocation,
      message,
      status: "pending",
    })

    // If client ID was extracted from token, associate the booking with their account
    if (clientId) {
      booking.client = clientId
      console.log("Setting client ID on booking:", clientId)
    }

    await booking.save()
    console.log("Booking saved with client ID:", booking.client)

    res.status(201).json({ message: "Booking request submitted successfully", booking })
  } catch (error) {
    console.error("Booking creation error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all bookings for a performer
router.get("/performer", authenticateToken, async (req, res) => {
  try {
    // Check if the user is a performer
    const user = await User.findById(req.user.id)
    if (!user || user.role !== "performer") {
      return res.status(403).json({ message: "Access denied. Only performers can access this endpoint." })
    }

    const bookings = await Booking.find({ performer: req.user.id }).sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    console.error("Get performer bookings error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all bookings made by a client
router.get("/client", authenticateToken, async (req, res) => {
  try {
    // Get the user ID from the token
    const userId = req.user.id
    console.log("Fetching bookings for client ID:", userId)

    // Find bookings where the client field matches the user ID
    const bookings = await Booking.find({ client: userId })
      .populate("performer", "name email genre location profileImage")
      .sort({ createdAt: -1 })

    console.log(`Found ${bookings.length} bookings for client ${userId}`)
    res.json(bookings)
  } catch (error) {
    console.error("Get client bookings error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Check if a time slot is available
router.get("/availability", async (req, res) => {
  try {
    const { performerId, date, startTime, endTime } = req.query

    if (!performerId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required parameters" })
    }

    // Check if there's already a booking for this date and time slot
    const existingBooking = await Booking.findOne({
      performer: performerId,
      date,
      "timeSlot.start": startTime,
      "timeSlot.end": endTime,
      status: { $in: ["pending", "confirmed"] },
    })

    res.json({ available: !existingBooking })
  } catch (error) {
    console.error("Check availability error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update booking status (confirm/reject)
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body

    if (!["pending", "confirmed", "rejected", "canceled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if the user is a performer and is the one who received the booking
    const user = await User.findById(req.user.id)
    if (!user || user.role !== "performer" || booking.performer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this booking" })
    }

    booking.status = status
    await booking.save()

    res.json({ message: "Booking status updated successfully", booking })
  } catch (error) {
    console.error("Update booking status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Cancel a booking (by client)
router.put("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if the user is a client and is the one who made the booking
    const user = await User.findById(req.user.id)
    if (!user || (booking.client && booking.client.toString() !== req.user.id)) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" })
    }

    booking.status = "canceled"
    await booking.save()

    res.json({ message: "Booking canceled successfully", booking })
  } catch (error) {
    console.error("Cancel booking error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
