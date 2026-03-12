const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "opsmind-jwt-secret"

// ✅ Verify any logged in user
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Access denied. No token provided." })

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." })
  }
}

// ✅ Admin only access
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied. Admins only." })
    next()
  })
}

module.exports = { verifyToken, verifyAdmin }