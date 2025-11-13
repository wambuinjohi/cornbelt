#!/usr/bin/env node

/**
 * Seed script for footer settings table
 * Usage: node scripts/seed-footer-settings.js
 *
 * This script:
 * 1. Creates the footer_settings table if it doesn't exist
 * 2. Seeds it with default footer data
 *
 * Note: The footer table will be automatically created when you first
 * access the Admin Footer Settings page and click "Initialize Footer Table"
 */

import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || "http://localhost:8080";

async function seedFooterSettings() {
  try {
    console.log("🚀 Starting footer settings seeding...");
    console.log(`📡 Using API URL: ${API_URL}`);

    // Step 1: Create table
    console.log("\n📋 Step 1: Creating footer_settings table...");
    const createTableResponse = await fetch(`${API_URL}/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: "footer_settings",
        create_table: true,
        columns: {
          id: "INT PRIMARY KEY AUTO_INCREMENT",
          phone: "VARCHAR(255) NOT NULL",
          email: "VARCHAR(255) NOT NULL",
          location: "VARCHAR(255) NOT NULL",
          facebookUrl: "VARCHAR(255)",
          instagramUrl: "VARCHAR(255)",
          twitterUrl: "VARCHAR(255)",
          updatedAt:
            "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        },
      }),
    });

    if (!createTableResponse.ok) {
      throw new Error(`HTTP ${createTableResponse.status}`);
    }

    const createResult = await createTableResponse.json();
    console.log("✅ Table creation result:", createResult);

    // Step 2: Insert default footer settings
    console.log("\n📝 Step 2: Inserting default footer settings...");
    const insertResponse = await fetch(`${API_URL}/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: "footer_settings",
        phone: "+254 (0) XXX XXX XXX",
        email: "info@cornbelt.co.ke",
        location: "Kenya",
        facebookUrl: "https://facebook.com",
        instagramUrl: "https://instagram.com",
        twitterUrl: "https://twitter.com",
      }),
    });

    if (!insertResponse.ok) {
      throw new Error(`HTTP ${insertResponse.status}`);
    }

    const insertResult = await insertResponse.json();
    console.log("✅ Insert result:", insertResult);

    if (insertResult.success || insertResult.id) {
      console.log(
        "\n✨ Footer settings table created and seeded successfully!",
      );
      console.log("\n📊 Seeded data:");
      console.log("  • Phone: +254 (0) XXX XXX XXX");
      console.log("  • Email: info@cornbelt.co.ke");
      console.log("  • Location: Kenya");
      console.log("  • Facebook: https://facebook.com");
      console.log("  • Instagram: https://instagram.com");
      console.log("  • Twitter: https://twitter.com");
      console.log(
        "\n💡 You can now manage these settings from Admin > Footer Settings",
      );
      process.exit(0);
    } else {
      console.error("❌ Failed to insert footer settings:", insertResult);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error seeding footer settings:", error.message);
    console.error(
      "\n💡 Make sure the development server is running (npm run dev)",
    );
    process.exit(1);
  }
}

seedFooterSettings();
