const express = require("express")
const router = express.Router()
const { signup, login, getProfile } = require("../controllers/authController")
const { verifyToken } = require("../middleware/authMiddleware")

// Public routes
router.post("/signup", signup)
router.post("/login", login)

// Protected route
router.get("/profile", verifyToken, getProfile)

module.exports = router