const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const ADMIN_SECRET = process.env.ADMIN_SECRET || "opsmind-admin-2025"
const JWT_SECRET = process.env.JWT_SECRET || "opsmind-jwt-secret"

// ================= SIGNUP =================
const signup = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password are required" })

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" })

    // Determine role
    const role = adminSecret === ADMIN_SECRET ? "admin" : "user"

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    })

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(201).json({
      message: `${role === "admin" ? "Admin" : "User"} registered successfully`,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    })

  } catch (error) {
    console.error("Signup Error:", error)
    res.status(500).json({ error: "Signup failed" })
  }
}

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" })

    // Find user
    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" })

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password" })

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    })

  } catch (error) {
    console.error("Login Error:", error)
    res.status(500).json({ error: "Login failed" })
  }
}

// ================= GET PROFILE =================
const getProfile = async (req, res) => {
  res.json({
    user: { id: req.user.id, name: req.user.name, role: req.user.role }
  })
}

module.exports = { signup, login, getProfile }