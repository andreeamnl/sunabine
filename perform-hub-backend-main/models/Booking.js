import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
  {
    performer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous bookings
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    clientPhone: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Store as YYYY-MM-DD
      required: true,
    },
    timeSlot: {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
    },
    eventDetails: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    eventLocation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "canceled"],
      default: "pending",
    },
    message: {
      type: String,
    },
  },
  { timestamps: true },
)

// Method to return booking without sensitive data
bookingSchema.methods.toJSON = function () {
  const booking = this.toObject()
  return booking
}

const Booking = mongoose.model("Booking", bookingSchema)

export default Booking
