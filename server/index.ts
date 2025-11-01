import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Contact form endpoint
  app.post("/api/contact", (req, res) => {
    const { fullName, email, phone, subject, message } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Email validation
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address",
      });
    }

    // Phone validation
    const phoneRegex =
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format",
      });
    }

    // Log contact submission (in a real app, you'd save to database or send email)
    console.log("New contact form submission:", {
      timestamp: new Date().toISOString(),
      fullName,
      email,
      phone,
      subject,
      message,
    });

    // Send success response
    res.json({
      success: true,
      message: "Your message has been received. We will get back to you soon.",
      data: {
        submittedAt: new Date().toISOString(),
      },
    });
  });

  return app;
}
