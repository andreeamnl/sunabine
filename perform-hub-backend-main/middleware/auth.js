import jwt from "jsonwebtoken"

export const authenticateToken = (req, res, next) => {
  try {
    // Get token from cookie, authorization header, or query parameter
    let token = req.cookies.token || req.query.token

    // Check for Authorization header and extract token
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token) {
      console.log("No token found in request")
      return res.status(401).json({ message: "Authentication required" })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
      req.user = decoded
      next()
    } catch (error) {
      console.error("Token verification failed:", error.message)
      return res.status(403).json({ message: "Invalid or expired token" })
    }
  } catch (error) {
    console.error("Authentication middleware error:", error)
    return res.status(500).json({ message: "Server error during authentication" })
  }
}
