import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { Readable } from "stream";
import { handleDemo } from "./routes/demo";
import fs from "fs";
import path from "path";

const API_BASE_URL = process.env.API_BASE_URL ?? "";

// Initialize database tables
async function initializeAdminTable() {
  try {
    if (!API_BASE_URL) {
      console.log(
        "API_BASE_URL not set — skipping external API table initialization",
      );
      return;
    }
    const baseUrl = API_BASE_URL;

    // Create admin_users table
    const adminTableData = {
      create_table: true,
      columns: {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        email: "VARCHAR(255) NOT NULL UNIQUE",
        password: "VARCHAR(255) NOT NULL",
        fullName: "VARCHAR(255) NOT NULL",
        createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
      },
    };

    await fetch(`${baseUrl}/api.php?table=admin_users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminTableData),
    });

    console.log("Admin table initialized");

    // Create contact_submissions table
    const contactTableData = {
      create_table: true,
      columns: {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        fullName: "VARCHAR(255) NOT NULL",
        email: "VARCHAR(255) NOT NULL",
        phone: "VARCHAR(20) NOT NULL",
        subject: "VARCHAR(255) NOT NULL",
        message: "TEXT NOT NULL",
        createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
      },
    };

    await fetch(`${baseUrl}/api.php?table=contact_submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactTableData),
    });

    console.log("Contact submissions table initialized");

    // Create chats table (stores chat session messages)
    const chatsTableData = {
      create_table: true,
      columns: {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        sessionId: "VARCHAR(255) NOT NULL",
        sender: "VARCHAR(50) NOT NULL", // 'user' | 'bot' | 'admin'
        message: "TEXT NOT NULL",
        createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
      },
    };

    await fetch(`${baseUrl}/api.php?table=chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chatsTableData),
    });

    console.log("Chats table initialized");

    // Create bot_responses table (admin-managed Q/A pairs)
    const botResponsesTableData = {
      create_table: true,
      columns: {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        keyword: "VARCHAR(255) NOT NULL",
        answer: "TEXT NOT NULL",
        createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
      },
    };

    await fetch(`${baseUrl}/api.php?table=bot_responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(botResponsesTableData),
    });

    console.log("Bot responses table initialized");

    // Seed basic bot responses if none exist
    const existingBot = await apiCall("GET", "bot_responses");
    if (!Array.isArray(existingBot) || existingBot.length === 0) {
      const defaultResponses = [
        {
          keyword: "hours",
          answer:
            "Our business hours are Monday - Friday: 8:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM, Sunday: Closed.",
        },
        {
          keyword: "location",
          answer:
            "We are located at Cornbelt Flour Mill Limited, National Cereals & Produce Board Land, Kenya.",
        },
        {
          keyword: "contact",
          answer:
            "You can reach us via email at info@cornbeltmill.com or support@cornbeltmill.com, or use the contact form on our website.",
        },
        {
          keyword: "products",
          answer:
            "We offer a range of fortified maize meal and other products. Visit our Products page for more details.",
        },
        {
          keyword: "shipping",
          answer:
            "For shipping inquiries, please contact our support team via email and provide your location so we can advise on availability and rates.",
        },
      ];

      for (const r of defaultResponses) {
        await apiCall("POST", "bot_responses", r);
      }

      console.log("Default bot responses seeded");
    }

    // Create hero_slider_images table
    const heroTableData = {
      create_table: true,
      columns: {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        filename: "VARCHAR(255) NOT NULL",
        imageUrl: "VARCHAR(500) NOT NULL",
        altText: "VARCHAR(255)",
        displayOrder: "INT DEFAULT 0",
        createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        updatedAt:
          "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      },
    };

    await fetch(`${baseUrl}/api.php?table=hero_slider_images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(heroTableData),
    });

    console.log("Hero slider images table initialized");

    // Create product_images table
    const productTableData = {
      create_table: true,
      columns: {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        productId: "VARCHAR(255) NOT NULL",
        filename: "VARCHAR(255) NOT NULL",
        imageUrl: "VARCHAR(500) NOT NULL",
        altText: "VARCHAR(255)",
        displayOrder: "INT DEFAULT 0",
        createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        updatedAt:
          "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      },
    };

    await fetch(`${baseUrl}/api.php?table=product_images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productTableData),
    });

    console.log("Product images table initialized");

    // Create testimonials table
    const testimonialTableData = {
      create_table: true,
      columns: {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        fullName: "VARCHAR(255) NOT NULL",
        location: "VARCHAR(255)",
        testimonialText: "TEXT NOT NULL",
        imageUrl: "VARCHAR(500)",
        rating: "INT DEFAULT 5",
        isPublished: "BOOLEAN DEFAULT true",
        displayOrder: "INT DEFAULT 0",
        createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        updatedAt:
          "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      },
    };

    await fetch(`${baseUrl}/api.php?table=testimonials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testimonialTableData),
    });

    console.log("Testimonials table initialized");

    // Seed sample testimonials if table is empty
    const existingTestimonials = await apiCall("GET", "testimonials");
    if (
      !Array.isArray(existingTestimonials) ||
      existingTestimonials.length === 0
    ) {
      const sampleTestimonials = [
        {
          fullName: "Margaret Kipchoge",
          location: "Nairobi, Kenya",
          testimonialText:
            "Cornbelt products have become a staple in our home. The quality is unmatched and my family loves the taste!",
          rating: 5,
          isPublished: true,
          displayOrder: 1,
        },
        {
          fullName: "James Mwangi",
          location: "Kisumu, Kenya",
          testimonialText:
            "I trust Cornbelt for my kids' nutrition. The fortification gives me peace of mind knowing they're getting quality nutrition.",
          rating: 5,
          isPublished: true,
          displayOrder: 2,
        },
        {
          fullName: "Grace Omondi",
          location: "Mombasa, Kenya",
          testimonialText:
            "The best maize meal I've used. Consistent quality, great taste, and I can always find it at my local shop!",
          rating: 5,
          isPublished: true,
          displayOrder: 3,
        },
        {
          fullName: "David Kariuki",
          location: "Nakuru, Kenya",
          testimonialText:
            "Cornbelt's commitment to quality is evident in every package. I recommend it to all my friends and family.",
          rating: 5,
          isPublished: true,
          displayOrder: 4,
        },
        {
          fullName: "Ruth Kipkorir",
          location: "Eldoret, Kenya",
          testimonialText:
            "The fortified maize meal has made a difference in my family's health. We've noticed improved energy levels.",
          rating: 5,
          isPublished: true,
          displayOrder: 5,
        },
      ];

      for (const testimonial of sampleTestimonials) {
        await apiCall("POST", "testimonials", testimonial);
      }

      console.log("Sample testimonials seeded");
    }

    // Create orders table
    const ordersTableData = {
      create_table: true,
      columns: {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        fullName: "VARCHAR(255) NOT NULL",
        email: "VARCHAR(255) NOT NULL",
        phone: "VARCHAR(20) NOT NULL",
        location: "VARCHAR(255)",
        product: "VARCHAR(255) NOT NULL",
        size: "VARCHAR(50) NOT NULL",
        quantity: "INT NOT NULL DEFAULT 1",
        deliveryDate: "DATE",
        notes: "TEXT",
        status: "VARCHAR(50) DEFAULT 'pending'",
        totalPrice: "DECIMAL(10, 2)",
        createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        updatedAt:
          "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      },
    };

    await fetch(`${baseUrl}/api.php?table=orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ordersTableData),
    });

    console.log("Orders table initialized");

    // Seed sample orders if table is empty
    const existingOrders = await apiCall("GET", "orders");
    if (!Array.isArray(existingOrders) || existingOrders.length === 0) {
      const sampleOrders = [
        {
          fullName: "John Kipchoge",
          email: "john@example.com",
          phone: "+254712345678",
          location: "Nairobi",
          product: "Jirani Maize Meal",
          size: "25kg",
          quantity: 5,
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          notes: "Deliver to shop on Moi Avenue",
          status: "pending",
          totalPrice: 2500.0,
        },
        {
          fullName: "Alice Njeri",
          email: "alice@example.com",
          phone: "+254701234567",
          location: "Kisumu",
          product: "Tabasamu Maize Meal",
          size: "2kg",
          quantity: 10,
          deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          notes: "Standard delivery",
          status: "confirmed",
          totalPrice: 1200.0,
        },
        {
          fullName: "David Mwangi",
          email: "david@example.com",
          phone: "+254722345678",
          location: "Nakuru",
          product: "Jirani Maize Meal",
          size: "2kg",
          quantity: 20,
          deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          notes: "Wholesale order",
          status: "confirmed",
          totalPrice: 2400.0,
        },
      ];

      for (const order of sampleOrders) {
        await apiCall("POST", "orders", order);
      }

      console.log("Sample orders seeded");
    }
  } catch (error) {
    console.error("Error initializing tables:", error);
  }
}

// Hash password utility
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Base64URL helpers
function base64urlEncode(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function base64urlDecode(str: string): string {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64").toString("utf8");
}

// Generate JWT token
function generateToken(adminId: number): string {
  const header = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64urlEncode(
    JSON.stringify({
      id: adminId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    }),
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
    const [header, payload, signature] = parts;

    const expectedSig = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "secret-key")
      .update(`${header}.${payload}`)
      .digest("base64url");
    if (signature !== expectedSig) return null;

    const payloadJson = JSON.parse(base64urlDecode(payload));
    if (payloadJson.exp < Math.floor(Date.now() / 1000)) return null;
    return payloadJson;
  } catch {
    return null;
  }
}

// External API helper
async function apiCall(
  method: string,
  table: string,
  data?: any,
  id?: number,
): Promise<any> {
  const baseUrl = API_BASE_URL;
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
  const contentType = response.headers.get("content-type") || "";
  const status = response.status;

  // If response is JSON, parse and return it. If not, include the raw text in a helpful error object.
  if (contentType.includes("application/json")) {
    try {
      const json = await response.json();
      if (!response.ok) {
        return { error: "External API returned an error", status, body: json };
      }
      return json;
    } catch (parseErr) {
      // Failed to parse JSON despite content-type claiming JSON — include raw text for debugging
      const text = await response.text();
      return {
        error: "Invalid JSON response from external API",
        status,
        contentType,
        body: text,
      };
    }
  } else {
    const text = await response.text();
    return {
      error: "Non-JSON response from external API",
      status,
      contentType,
      body: text,
    };
  }
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve project-level assets in dev/production at /assets/*
  try {
    const assetsDir = path.join(process.cwd(), 'assets');
    app.use('/assets', express.static(assetsDir));
  } catch (e) {
    console.warn('Failed to set up assets static middleware:', e);
  }

  // Initialize admin table on startup
  initializeAdminTable();

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Sitemap
  app.get("/sitemap.xml", (_req, res) => {
    res.header("Content-Type", "application/xml");
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://cornbelt.co.ke/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://cdn.builder.io/api/v1/image/assets%2Fbf7a511dd4454ae88c7c49627a9a0f54%2F80b3bed3a8e14bf3ae5cc941d2cfab50?format=webp&width=1200</image:loc>
      <image:title>Cornbelt Flour Mill</image:title>
    </image:image>
  </url>
  <url>
    <loc>https://cornbelt.co.ke/products</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://cornbelt.co.ke/about</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://cornbelt.co.ke/contact</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    res.send(sitemap);
  });

  // Robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.header("Content-Type", "text/plain");
    const robots = `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: https://cornbelt.co.ke/sitemap.xml
Disallow: /admin/
Disallow: /api/`;
    res.send(robots);
  });

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
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to create admin",
      });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      // Fetch all admin users and find by email
      const users = await apiCall("GET", "admin_users");
      if (!Array.isArray(users)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = users.find(
        (u: any) => u.email === email && u.password === hashPassword(password),
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

  // Development-only debug endpoints to inspect and seed admin_users
  if (process.env.NODE_ENV !== 'production') {
    app.get('/api/debug/admin-users', async (_req, res) => {
      try {
        const users = await apiCall('GET', 'admin_users');
        res.json(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error('Debug: fetch admin_users failed', err);
        res.status(500).json({ error: 'Failed to fetch admin_users' });
      }
    });

    app.post('/api/debug/seed-admin', async (req, res) => {
      try {
        const { email, password, fullName } = req.body;
        if (!email || !password || !fullName) {
          return res.status(400).json({ error: 'email, password, fullName required' });
        }

        // Check existing
        const existing = await apiCall('GET', 'admin_users');
        if (Array.isArray(existing) && existing.some((u: any) => u.email === email)) {
          return res.status(400).json({ error: 'Admin already exists' });
        }

        const hashed = hashPassword(password);
        const result = await apiCall('POST', 'admin_users', {
          email,
          password: hashed,
          fullName,
          createdAt: new Date().toISOString(),
        });

        res.json(result);
      } catch (err) {
        console.error('Debug seed admin failed', err);
        res.status(500).json({ error: 'Failed to seed admin' });
      }
    });
  }

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

  // Hero Slider Images Management
  app.get("/api/admin/hero-images", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const images = await apiCall("GET", "hero_slider_images");
      const sortedImages = Array.isArray(images)
        ? images.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
        : [];
      res.json(sortedImages);
    } catch (error) {
      console.error("Error fetching hero images:", error);
      res.json([]);
    }
  });

  app.post("/api/admin/hero-images", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { imageUrl, altText, displayOrder } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    try {
      const filename = `hero-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      const storagePath = `https://cornbelt.co.ke/sliderimages/${filename}`;

      const result = await apiCall("POST", "hero_slider_images", {
        filename,
        imageUrl: storagePath,
        altText: altText || "Hero slider image",
        displayOrder: displayOrder || 0,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Image added successfully",
        id: result.id,
        imageUrl: storagePath,
      });
    } catch (error) {
      console.error("Error adding hero image:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to add image",
      });
    }
  });

  app.put("/api/admin/hero-images/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { altText, displayOrder } = req.body;

    try {
      const updates: any = {};
      if (altText !== undefined) updates.altText = altText;
      if (displayOrder !== undefined) updates.displayOrder = displayOrder;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const result = await apiCall(
        "PUT",
        "hero_slider_images",
        updates,
        parseInt(id),
      );

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Image updated successfully",
      });
    } catch (error) {
      console.error("Error updating hero image:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to update image",
      });
    }
  });

  app.delete("/api/admin/hero-images/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    try {
      const result = await apiCall(
        "DELETE",
        "hero_slider_images",
        null,
        parseInt(id),
      );

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting hero image:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to delete image",
      });
    }
  });

  // File upload endpoint — saves images to /assets/hero_slider_images and returns a public path
  app.post("/api/admin/upload", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { fileData, fileName } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({ error: "File data and name are required" });
    }

    try {
      // Decode base64
      const buffer = Buffer.from(fileData, "base64");

      // Sanitize extension
      const ext = path.extname(fileName) || ".jpg";
      const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "") || ".jpg";

      // Build filename
      const filename = `hero-${Date.now()}-${Math.random().toString(36).slice(2,9)}${safeExt}`;

      // Ensure assets folder exists at project root: /assets/hero_slider_images
      const assetsDir = path.join(process.cwd(), "assets", "hero_slider_images");
      fs.mkdirSync(assetsDir, { recursive: true });

      const filePath = path.join(assetsDir, filename);
      fs.writeFileSync(filePath, buffer);

      // Public URL path served by node-build static middleware
      const imageUrl = `/assets/hero_slider_images/${filename}`;

      res.json({ success: true, imageUrl, filename });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to process file",
      });
    }
  });

  // Helper function to get MIME type from filename
  function getImageMimeType(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "jpeg",
      jpeg: "jpeg",
      png: "png",
      gif: "gif",
      webp: "webp",
      svg: "svg+xml",
    };
    return mimeTypes[ext || "jpeg"] || "jpeg";
  }

  // Public endpoint to get hero images
  app.get("/api/hero-images", async (_req, res) => {
    try {
      const images = await apiCall("GET", "hero_slider_images");
      const sortedImages = Array.isArray(images)
        ? images.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
        : [];
      res.json(sortedImages);
    } catch (error) {
      console.error("Error fetching hero images:", error);
      res.json([]);
    }
  });

  // Admin product images management
  app.get("/api/admin/product-images", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const images = await apiCall("GET", "product_images");
      const sortedImages = Array.isArray(images)
        ? images.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
        : [];
      res.json(sortedImages);
    } catch (error) {
      console.error("Error fetching product images:", error);
      res.json([]);
    }
  });

  app.post("/api/admin/product-images", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId, imageUrl, altText, displayOrder } = req.body;

    if (!productId || !imageUrl) {
      return res
        .status(400)
        .json({ error: "Product ID and image URL are required" });
    }

    try {
      const filename = `product-${productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      const storagePath = `https://cornbelt.co.ke/productimages/${filename}`;

      const result = await apiCall("POST", "product_images", {
        productId,
        filename,
        imageUrl: storagePath,
        altText: altText || "Product image",
        displayOrder: displayOrder || 0,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Product image added successfully",
        id: result.id,
        imageUrl: storagePath,
      });
    } catch (error) {
      console.error("Error adding product image:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to add image",
      });
    }
  });

  app.put("/api/admin/product-images/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { altText, displayOrder } = req.body;

    try {
      const updates: any = {};
      if (altText !== undefined) updates.altText = altText;
      if (displayOrder !== undefined) updates.displayOrder = displayOrder;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const result = await apiCall(
        "PUT",
        "product_images",
        updates,
        parseInt(id),
      );

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Product image updated successfully",
      });
    } catch (error) {
      console.error("Error updating product image:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to update image",
      });
    }
  });

  app.delete("/api/admin/product-images/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    try {
      const result = await apiCall(
        "DELETE",
        "product_images",
        null,
        parseInt(id),
      );

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Product image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product image:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to delete image",
      });
    }
  });

  // Public endpoint to get product images
  app.get("/api/product-images", async (req, res) => {
    try {
      const productId = req.query.productId as string;
      const images = await apiCall("GET", "product_images");

      let productImages = Array.isArray(images) ? images : [];

      if (productId) {
        productImages = productImages.filter(
          (img: any) => img.productId === productId,
        );
      }

      const sortedImages = productImages.sort(
        (a: any, b: any) => a.displayOrder - b.displayOrder,
      );

      res.json(sortedImages);
    } catch (error) {
      console.error("Error fetching product images:", error);
      res.json([]);
    }
  });

  // Lightweight emulation of legacy api.php for local development/testing.
  // Supports: create_table, drop_table, alter_table (ADD/MODIFY/CHANGE/DROP), CRUD on records
  app.all("/api.php", async (req, res) => {
    try {
      // store data in app.locals for process-lifetime persistence
      const db = (app.locals._phpDB ||= {} as Record<string, any[]>);
      const meta = (app.locals._phpMeta ||= {} as Record<
        string,
        Record<string, string>
      >);
      const seq = (app.locals._phpSeq ||= {} as Record<string, number>);

      const method = req.method.toUpperCase();
      const table = (req.query.table || req.body.table) as string;
      const idParam = req.query.id as string | undefined;

      if (!table) {
        return res.status(400).json({ error: "Missing 'table' parameter" });
      }

      // Helpers
      const ensureTable = (name: string) => {
        if (!db[name]) {
          db[name] = [];
          meta[name] = {};
          seq[name] = 1;
        }
      };

      // POST: create table or insert
      if (method === "POST") {
        // create_table
        if (req.body && req.body.create_table) {
          const columns = req.body.columns || {};
          db[table] = [];
          meta[table] = columns;
          seq[table] = 1;
          return res.json({ success: true, table, columns });
        }

        // drop_table
        if (req.body && req.body.drop_table) {
          delete db[req.body.drop_table];
          delete meta[req.body.drop_table];
          delete seq[req.body.drop_table];
          return res.json({ success: true, dropped: req.body.drop_table });
        }

        // alter_table
        if (req.body && req.body.alter_table) {
          ensureTable(table);
          const actions = Array.isArray(req.body.actions)
            ? req.body.actions
            : [];
          for (const a of actions) {
            const type = (a.type || "").toUpperCase();
            if (type === "ADD") {
              meta[table][a.name] = a.definition || "TEXT";
              // no further action needed for existing rows
            } else if (type === "MODIFY") {
              if (meta[table][a.name])
                meta[table][a.name] = a.definition || meta[table][a.name];
            } else if (type === "CHANGE") {
              const newName = a.new_name || a.name;
              if (meta[table][a.name] !== undefined) {
                meta[table][newName] = a.definition || meta[table][a.name];
                delete meta[table][a.name];
                // rename keys in rows
                for (const r of db[table]) {
                  if (r.hasOwnProperty(a.name)) {
                    r[newName] = r[a.name];
                    delete r[a.name];
                  }
                }
              }
            } else if (type === "DROP") {
              delete meta[table][a.name];
              for (const r of db[table]) {
                delete r[a.name];
              }
            }
          }
          return res.json({ success: true, table, meta: meta[table] });
        }

        // Insert record
        ensureTable(table);
        const payload = { ...(req.body || {}) };
        // remove control keys if present
        delete payload.create_table;
        delete payload.alter_table;
        delete payload.drop_table;

        const newId = seq[table]++;
        const record = { id: newId, ...payload };
        db[table].push(record);
        return res.json({ success: true, id: newId, record });
      }

      // GET: read records
      if (method === "GET") {
        ensureTable(table);
        if (idParam) {
          const id = Number(idParam);
          const row = db[table].find((r) => Number(r.id) === id) || null;
          return res.json(row);
        }
        return res.json(db[table]);
      }

      // PUT: update record
      if (method === "PUT" || method === "PATCH") {
        ensureTable(table);
        const id = idParam
          ? Number(idParam)
          : req.body && req.body.id
            ? Number(req.body.id)
            : undefined;
        if (!id)
          return res.status(400).json({ error: "Missing id for update" });
        const idx = db[table].findIndex((r) => Number(r.id) === id);
        if (idx === -1)
          return res.status(404).json({ error: "Record not found" });
        const updates = { ...(req.body || {}) };
        delete updates.id;
        const updated = Object.assign({}, db[table][idx], updates);
        db[table][idx] = updated;
        return res.json({ success: true, id, record: updated });
      }

      // DELETE: remove record
      if (method === "DELETE") {
        ensureTable(table);
        const id = idParam
          ? Number(idParam)
          : req.body && req.body.id
            ? Number(req.body.id)
            : undefined;
        if (!id)
          return res.status(400).json({ error: "Missing id for delete" });
        const idx = db[table].findIndex((r) => Number(r.id) === id);
        if (idx === -1)
          return res.status(404).json({ error: "Record not found" });
        db[table].splice(idx, 1);
        return res.json({ success: true, id });
      }

      return res.status(405).json({ error: "Method not supported" });
    } catch (error) {
      console.error("/api.php emulation error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Admin testimonials management
  app.get("/api/admin/testimonials", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const testimonials = await apiCall("GET", "testimonials");
      const sortedTestimonials = Array.isArray(testimonials)
        ? testimonials.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
        : [];
      res.json(sortedTestimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.json([]);
    }
  });

  app.post("/api/admin/testimonials", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      fullName,
      location,
      testimonialText,
      imageUrl,
      rating,
      displayOrder,
      isPublished,
    } = req.body;

    if (!fullName || !testimonialText) {
      return res.status(400).json({
        error: "Full name and testimonial text are required",
      });
    }

    try {
      const filename = imageUrl
        ? `testimonial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
        : null;
      const storagePath = filename
        ? `https://cornbelt.co.ke/testimonials/${filename}`
        : null;

      const result = await apiCall("POST", "testimonials", {
        fullName,
        location: location || null,
        testimonialText,
        imageUrl: storagePath,
        rating: rating || 5,
        displayOrder: displayOrder || 0,
        isPublished: isPublished !== false,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Testimonial added successfully",
        id: result.id,
        imageUrl: storagePath,
      });
    } catch (error) {
      console.error("Error adding testimonial:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to add testimonial",
      });
    }
  });

  app.put("/api/admin/testimonials/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const {
      fullName,
      location,
      testimonialText,
      rating,
      displayOrder,
      isPublished,
    } = req.body;

    try {
      const updates: any = {};
      if (fullName !== undefined) updates.fullName = fullName;
      if (location !== undefined) updates.location = location;
      if (testimonialText !== undefined)
        updates.testimonialText = testimonialText;
      if (rating !== undefined) updates.rating = rating;
      if (displayOrder !== undefined) updates.displayOrder = displayOrder;
      if (isPublished !== undefined) updates.isPublished = isPublished;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const result = await apiCall(
        "PUT",
        "testimonials",
        updates,
        parseInt(id),
      );

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Testimonial updated successfully",
      });
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update testimonial",
      });
    }
  });

  app.delete("/api/admin/testimonials/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    try {
      const result = await apiCall(
        "DELETE",
        "testimonials",
        null,
        parseInt(id),
      );

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Testimonial deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete testimonial",
      });
    }
  });

  // Public endpoint to get testimonials
  app.get("/api/testimonials", async (_req, res) => {
    try {
      const testimonials = await apiCall("GET", "testimonials");

      let publishedTestimonials = Array.isArray(testimonials)
        ? testimonials.filter((t: any) => t.isPublished !== false)
        : [];

      const sortedTestimonials = publishedTestimonials.sort(
        (a: any, b: any) => a.displayOrder - b.displayOrder,
      );

      res.json(sortedTestimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
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
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format",
      });
    }

    try {
      // Save to database
      const result = await apiCall("POST", "contact_submissions", {
        fullName,
        email,
        phone,
        subject,
        message,
        createdAt: new Date().toISOString(),
      });

      console.log("New contact form submission saved:", {
        id: result.id,
        timestamp: new Date().toISOString(),
        fullName,
        email,
      });

      // Send success response
      res.json({
        success: true,
        message:
          "Your message has been received. We will get back to you soon.",
        data: {
          submittedAt: new Date().toISOString(),
          id: result.id,
        },
      });
    } catch (error) {
      console.error("Error saving contact submission:", error);
      // Still return success to user but log the error
      res.json({
        success: true,
        message:
          "Your message has been received. We will get back to you soon.",
        data: {
          submittedAt: new Date().toISOString(),
        },
      });
    }
  });

  // Orders endpoints
  app.post("/api/orders", async (req, res) => {
    const {
      fullName,
      email,
      phone,
      location,
      product,
      size,
      quantity,
      deliveryDate,
      notes,
    } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !product || !size || !quantity) {
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
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format",
      });
    }

    try {
      // Calculate price based on product and size (simple pricing)
      let pricePerUnit = 0;
      if (product === "Jirani Maize Meal") {
        pricePerUnit = size === "2kg" ? 120 : 500;
      } else if (product === "Tabasamu Maize Meal") {
        pricePerUnit = size === "2kg" ? 150 : 600;
      }

      const totalPrice = pricePerUnit * quantity;

      // Save to database
      const result = await apiCall("POST", "orders", {
        fullName,
        email,
        phone,
        location: location || null,
        product,
        size,
        quantity,
        deliveryDate: deliveryDate || null,
        notes: notes || null,
        status: "pending",
        totalPrice,
        createdAt: new Date().toISOString(),
      });

      console.log("New order saved:", {
        id: result.id,
        timestamp: new Date().toISOString(),
        fullName,
        product,
        quantity,
      });

      // Send success response
      res.json({
        success: true,
        message: "Order received! We will contact you shortly to confirm.",
        data: {
          orderId: result.id,
          submittedAt: new Date().toISOString(),
          estimatedPrice: totalPrice,
        },
      });
    } catch (error) {
      console.error("Error saving order:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process order",
      });
    }
  });

  // Admin orders endpoints
  app.get("/api/admin/orders", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const orders = await apiCall("GET", "orders");
      const sortedOrders = Array.isArray(orders)
        ? orders.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
        : [];
      res.json(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.json([]);
    }
  });

  app.put("/api/admin/orders/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    try {
      const updates: any = {};
      if (status !== undefined) updates.status = status;
      if (notes !== undefined) updates.notes = notes;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const result = await apiCall("PUT", "orders", updates, parseInt(id));

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Order updated successfully",
      });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to update order",
      });
    }
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    try {
      const result = await apiCall("DELETE", "orders", null, parseInt(id));

      if (result.error) {
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to delete order",
      });
    }
  });

  // Chat endpoints (visitor-facing)
  app.post("/api/chat/message", async (req, res) => {
    const { sessionId, name, message } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message required" });
    }

    try {
      // Save user message
      await apiCall("POST", "chats", {
        sessionId,
        sender: "user",
        message,
        createdAt: new Date().toISOString(),
      });

      // Fetch bot responses and attempt to match
      const responses = await apiCall("GET", "bot_responses");
      let botReply = null;
      if (Array.isArray(responses)) {
        const text = message.toLowerCase();
        // simple keyword match
        for (const r of responses) {
          const keyword = (r.keyword || "").toLowerCase();
          if (!keyword) continue;
          if (text.includes(keyword)) {
            botReply = r.answer;
            break;
          }
        }
      }

      // Fallback reply
      if (!botReply) {
        botReply =
          "Thanks for your message! Our team will get back to you shortly. You can also visit the Contact page for more ways to reach us.";
      }

      // Save bot reply
      const botResult = await apiCall("POST", "chats", {
        sessionId,
        sender: "bot",
        message: botReply,
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true, reply: botReply, botId: botResult.id });
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  app.get("/api/chat/history", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    if (!sessionId)
      return res.status(400).json({ error: "sessionId required" });

    try {
      const all = await apiCall("GET", "chats");
      const messages = Array.isArray(all)
        ? all.filter((m: any) => m.sessionId === sessionId)
        : [];
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.json([]);
    }
  });

  // Admin endpoints to manage bot responses and view chats
  app.get("/api/admin/bot-responses", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !verifyToken(token))
      return res.status(401).json({ error: "Unauthorized" });
    try {
      const responses = await apiCall("GET", "bot_responses");
      res.json(Array.isArray(responses) ? responses : []);
    } catch (error) {
      console.error("Error fetching bot responses:", error);
      res.json([]);
    }
  });

  app.post("/api/admin/bot-responses", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !verifyToken(token))
      return res.status(401).json({ error: "Unauthorized" });
    const { keyword, answer } = req.body;
    if (!keyword || !answer)
      return res.status(400).json({ error: "keyword and answer required" });
    try {
      const result = await apiCall("POST", "bot_responses", {
        keyword,
        answer,
        createdAt: new Date().toISOString(),
      });
      res.json({ success: true, id: result.id });
    } catch (error) {
      console.error("Error creating bot response:", error);
      res.status(500).json({ error: "Failed to create" });
    }
  });

  app.put("/api/admin/bot-responses/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !verifyToken(token))
      return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const { keyword, answer } = req.body;
    const updates: any = {};
    if (keyword !== undefined) updates.keyword = keyword;
    if (answer !== undefined) updates.answer = answer;
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No fields to update" });
    try {
      await apiCall("PUT", "bot_responses", updates, parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating bot response:", error);
      res.status(500).json({ error: "Failed to update" });
    }
  });

  app.delete("/api/admin/bot-responses/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !verifyToken(token))
      return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    try {
      await apiCall("DELETE", "bot_responses", null, parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bot response:", error);
      res.status(500).json({ error: "Failed to delete" });
    }
  });

  app.post("/api/admin/reseed-bot-responses", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !verifyToken(token))
      return res.status(401).json({ error: "Unauthorized" });

    try {
      const defaultResponses = [
        {
          keyword: "hours",
          answer:
            "Our business hours are Monday - Friday: 8:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM, Sunday: Closed.",
        },
        {
          keyword: "location",
          answer:
            "We are located at Cornbelt Flour Mill Limited, National Cereals & Produce Board Land, Kenya.",
        },
        {
          keyword: "contact",
          answer:
            "You can reach us via email at info@cornbeltmill.com or support@cornbeltmill.com, or use the contact form on our website.",
        },
        {
          keyword: "products",
          answer:
            "We offer a range of fortified maize meal and other products. Visit our Products page for more details.",
        },
        {
          keyword: "shipping",
          answer:
            "For shipping inquiries, please contact our support team via email and provide your location so we can advise on availability and rates.",
        },
      ];

      for (const r of defaultResponses) {
        await apiCall("POST", "bot_responses", r);
      }

      res.json({
        success: true,
        message: "Bot responses reseeded successfully",
        count: defaultResponses.length,
      });
    } catch (error) {
      console.error("Error reseeding bot responses:", error);
      res.status(500).json({ error: "Failed to reseed responses" });
    }
  });

  app.get("/api/admin/chat-sessions", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !verifyToken(token))
      return res.status(401).json({ error: "Unauthorized" });
    try {
      const all = await apiCall("GET", "chats");
      const sessions: Record<string, any[]> = {};
      if (Array.isArray(all)) {
        for (const m of all) {
          sessions[m.sessionId] = sessions[m.sessionId] || [];
          sessions[m.sessionId].push(m);
        }
      }
      const sessionList = Object.keys(sessions).map((sid) => ({
        sessionId: sid,
        lastMessageAt:
          sessions[sid][sessions[sid].length - 1]?.createdAt || null,
        messages: sessions[sid],
      }));
      res.json(sessionList);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.json([]);
    }
  });

  app.get("/api/admin/chat/:sessionId", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !verifyToken(token))
      return res.status(401).json({ error: "Unauthorized" });
    const { sessionId } = req.params;
    try {
      const all = await apiCall("GET", "chats");
      const messages = Array.isArray(all)
        ? all.filter((m: any) => m.sessionId === sessionId)
        : [];
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.json([]);
    }
  });

  return app;
}
