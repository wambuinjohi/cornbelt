import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { handleDemo } from "./routes/demo";

// Hash password utility
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Generate JWT token
function generateToken(adminId: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      id: adminId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  );
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "secret-key")
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

// Verify JWT token
function verifyToken(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// External API helper
async function apiCall(
  method: string,
  table: string,
  data?: any,
  id?: number
): Promise<any> {
  const baseUrl = "https://cornbelt.co.ke";
  let url = `${baseUrl}/api.php?table=${table}`;
  if (id) url += `&id=${id}`;

  const options: any = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  return await response.json();
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize admin table on startup
  initializeAdminTable();

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Admin endpoints
  app.get("/api/admin/check-initialized", async (_req, res) => {
    try {
      const result = await apiCall("GET", "admin_users");
      const initialized = Array.isArray(result) && result.length > 0;
      res.json({ initialized });
    } catch (error) {
      res.json({ initialized: false });
    }
  });

  app.post("/api/admin/setup", async (req, res) => {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ error: "Missing required fields (email, password, fullName)" });
    }

    try {
      // Check if admin already exists
      const existing = await apiCall("GET", "admin_users");
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(400).json({ error: "Admin already initialized" });
      }

      // Hash password
      const hashedPassword = hashPassword(password);

      // Create admin user
      const result = await apiCall("POST", "admin_users", {
        email,
        password: hashedPassword,
        fullName,
        createdAt: new Date().toISOString(),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Admin account created successfully",
        id: result.id,
      });
    } catch (error) {
      console.error("Setup error:", error);
      res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to create admin",
        });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    try {
      // Fetch all admin users and find by email
      const users = await apiCall("GET", "admin_users");
      if (!Array.isArray(users)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = users.find(
        (u: any) => u.email === email && u.password === hashPassword(password)
      );

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user.id);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/admin/contact-submissions", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const submissions = await apiCall("GET", "contact_submissions");
      res.json(Array.isArray(submissions) ? submissions : []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.json([]);
    }
  });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
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
