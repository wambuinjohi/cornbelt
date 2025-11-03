#!/usr/bin/env node

/**
 * Visitor Tracking Table Migration Script
 * Run this script to create the visitor_tracking table in your database
 * Usage: node scripts/migrate-visitor-tracking.js
 */

const API_URL = "https://cornbelt.co.ke/api.php";
const TABLE_NAME = "visitor_tracking";

const tableConfig = {
  create_table: true,
  table: TABLE_NAME,
  columns: {
    id: "INT AUTO_INCREMENT PRIMARY KEY",
    page_url: "VARCHAR(500)",
    previous_page: "VARCHAR(500) NULL",
    timestamp: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    user_agent: "TEXT",
    device_type: "VARCHAR(50)",
    screen_resolution: "VARCHAR(50)",
    screen_width: "INT",
    screen_height: "INT",
    browser_language: "VARCHAR(10)",
    timezone: "VARCHAR(50)",
    timezone_offset: "INT",
    referrer: "TEXT",
    connection_type: "VARCHAR(50)",
    memory: "VARCHAR(50)",
    processor_cores: "INT",
    platform: "VARCHAR(100)",
    session_id: "VARCHAR(255) UNIQUE",
    geolocation_latitude: "DECIMAL(10, 8) NULL",
    geolocation_longitude: "DECIMAL(11, 8) NULL",
    geolocation_accuracy: "INT NULL",
    viewport_width: "INT",
    viewport_height: "INT",
    color_depth: "INT",
    pixel_depth: "INT",
    do_not_track: "VARCHAR(10) NULL",
    local_time: "VARCHAR(100)",
    ip_address: "VARCHAR(45) NULL",
    created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    updated_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  },
};

async function migrate() {
  console.log(`🔄 Starting migration for table: ${TABLE_NAME}...`);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tableConfig),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log(`✅ Successfully created table '${TABLE_NAME}'`);
      console.log(`📊 Total columns created: ${Object.keys(tableConfig.columns).length}`);
      console.log("\n📋 Table Structure:");
      Object.entries(tableConfig.columns).forEach(([name, type]) => {
        console.log(`   - ${name}: ${type}`);
      });
      console.log("\n✨ Migration completed successfully!");
      process.exit(0);
    } else if (result.success) {
      console.log(`✅ ${result.success}`);
      console.log("\n📋 Table Structure:");
      Object.entries(tableConfig.columns).forEach(([name, type]) => {
        console.log(`   - ${name}: ${type}`);
      });
      console.log("\n✨ Migration completed successfully!");
      process.exit(0);
    } else {
      console.error(`❌ Migration failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error during migration:", error.message);
    process.exit(1);
  }
}

migrate();
