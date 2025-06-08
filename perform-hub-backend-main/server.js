import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

// Routes
import authRoutes from "./routes/auth.js"
import performerRoutes from "./routes/performers.js"
import bookingRoutes from './routes/bookings.js'

// Load env variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
)

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/performer-booking")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/performers", performerRoutes)
app.use("/api/bookings", bookingRoutes)

// Root route for health check
app.get("/", (req, res) => {
  res.send("API is running");
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
