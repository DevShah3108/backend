require('dotenv').config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS dynamically
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Server is up and running ✅");
});

// Basic test route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from Node.js backend!" });
});

// Email route
app.post("/api/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Transport config with environment variables
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS
      },
    });

    // Email options
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.USER_EMAIL,
      subject: subject,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);

    res.status(200).json({ message: "Email sent successfully!" });

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ 
      message: "Failed to send email.", 
      error: error.message 
    });
  }
});

// Start server with production settings
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(',')}`);
});