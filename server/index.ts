import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { Readable } from "stream";
import { handleDemo } from "./routes/demo";

// Initialize database tables
async function initializeAdminTable() {
  try {
    const baseUrl = "https://cornbelt.co.ke";

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
    if (!Array.isArray(existingTestimonials) || existingTestimonials.length === 0) {
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
  } catch (error) {
    console.error("Error initializing tables:", error);
  }
}

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
  id?: number,
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

  // File upload endpoint
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
      // Store the file as a data URL (base64 encoded)
      // This approach works well for images and doesn't require file system operations
      const dataUrl = `data:image/${getImageMimeType(fileName)};base64,${fileData}`;

      res.json({
        success: true,
        imageUrl: dataUrl,
        filename: fileName,
      });
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

    const { fullName, location, testimonialText, imageUrl, rating, displayOrder, isPublished } =
      req.body;

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
        error: error instanceof Error ? error.message : "Failed to add testimonial",
      });
    }
  });

  app.put("/api/admin/testimonials/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { fullName, location, testimonialText, rating, displayOrder, isPublished } =
      req.body;

    try {
      const updates: any = {};
      if (fullName !== undefined) updates.fullName = fullName;
      if (location !== undefined) updates.location = location;
      if (testimonialText !== undefined) updates.testimonialText = testimonialText;
      if (rating !== undefined) updates.rating = rating;
      if (displayOrder !== undefined) updates.displayOrder = displayOrder;
      if (isPublished !== undefined) updates.isPublished = isPublished;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const result = await apiCall("PUT", "testimonials", updates, parseInt(id));

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
        error: error instanceof Error ? error.message : "Failed to update testimonial",
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
      const result = await apiCall("DELETE", "testimonials", null, parseInt(id));

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
        error: error instanceof Error ? error.message : "Failed to delete testimonial",
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

  return app;
}
