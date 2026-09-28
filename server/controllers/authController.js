const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const COMMON_PASSWORDS = [
  "password",
  "123456",
  "qwerty",
  "admin",
  "welcome",
  "letmein",
];

const normalizePassword = (password) =>
  password
    .toLowerCase()
    .replace(/[4@]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9]/g, "");

const getPasswordError = (password, username, email) => {
  if (password.length < 12) {
    return "Password must be at least 12 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include a number";
  }
  if (!/[!@#$%&*]/.test(password)) {
    return "Password must include a symbol: ! @ # $ % & *";
  }

  const personalInfo = [username, email.split("@")[0]]
    .filter((value) => value.length >= 3)
    .map((value) => value.toLowerCase());
  const lowerPassword = password.toLowerCase();
  if (personalInfo.some((value) => lowerPassword.includes(value))) {
    return "Password must not contain your username or email";
  }

  const normalized = normalizePassword(password);
  if (
    COMMON_PASSWORDS.some(
      (commonPassword) =>
        normalized.includes(commonPassword) ||
        lowerPassword.includes(commonPassword),
    ) ||
    /asdfgh|qwerty|zxcvbn|1234|2345|3456|4567|5678|6789/i.test(password) ||
    /(.)\1{3,}/i.test(password)
  ) {
    return "Password must not use common words or simple patterns";
  }

  return null;
};

const generateToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

const formatUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
});

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const passwordError = getPasswordError(password, username, email);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user),
      user: formatUser(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Email or username already in use" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    const isMatch = user && (await bcrypt.compare(password, user.password));

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: formatUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
