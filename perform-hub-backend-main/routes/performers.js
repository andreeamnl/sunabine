import express from "express"
import User from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get all performers
router.get("/", async (req, res) => {
  try {
    // Only fetch users with role "performer"
    const performers = await User.find({ role: "performer" }).select("-password")
    res.json(performers)
  } catch (error) {
    console.error("Error fetching performers:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get performer by ID
router.get("/:id", async (req, res) => {
  try {
    const performer = await User.findById(req.params.id).select("-password")
    if (!performer) {
      return res.status(404).json({ message: "Performer not found" })
    }

    // Log the availability data for debugging
    console.log("Performer availability data:", performer.availability)

    res.json(performer)
  } catch (error) {
    console.error("Get performer error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update performer availability
router.post("/availability", authenticateToken, async (req, res) => {
  try {
    const { dates } = req.body
    console.log("Updating availability with data:", dates)

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.availability = dates
    await user.save()

    console.log("Updated availability:", user.availability)
    res.json({ message: "Availability updated successfully", user })
  } catch (error) {
    console.error("Update availability error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update performer profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update text fields from req.body
    const { bio, genre, location, phone, profileImage, bannerImage, media } = req.body

    // Update fields if provided
    if (bio !== undefined) user.bio = bio
    if (genre !== undefined) user.genre = genre
    if (location !== undefined) user.location = location
    if (phone !== undefined) user.phone = phone
    if (profileImage !== undefined) user.profileImage = profileImage
    if (bannerImage !== undefined) user.bannerImage = bannerImage

    // Handle media array
    if (media && Array.isArray(media)) {
      user.media = media
    }

    await user.save()

    res.json({ message: "Profile updated successfully", user })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
