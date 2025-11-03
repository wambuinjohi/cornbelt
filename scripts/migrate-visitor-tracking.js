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
    updated_at:
      "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  },
};

async function migrate() {
  console.log(`🔄 Starting migration for table: ${TABLE_NAME}...`);
  console.log(`📍 API URL: ${API_URL}\n`);

  try {
    const url = new URL(API_URL);
    url.searchParams.append("table", TABLE_NAME);

    console.log(`📤 Sending request to: ${url.toString()}\n`);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tableConfig),
    });

    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error(`❌ Invalid JSON response from API:`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Response: ${responseText || "(empty)"}`);
      console.error(`\n💡 Troubleshooting:`);
      console.error(`   1. Check if the API is running correctly`);
      console.error(`   2. Verify the database credentials in api.php`);
      console.error(`   3. Check PHP error logs for backend errors`);
      process.exit(1);
    }

    if (response.ok && (result.success || result.message)) {
      console.log(`✅ Successfully created table '${TABLE_NAME}'`);
      console.log(
        `📊 Total columns created: ${Object.keys(tableConfig.columns).length}`,
      );
      console.log(`📝 Response: ${result.success || result.message}\n`);
      console.log("📋 Table Structure:");
      Object.entries(tableConfig.columns).forEach(([name, type]) => {
        console.log(`   - ${name}: ${type}`);
      });
      console.log("\n✨ Migration completed successfully!");
      process.exit(0);
    } else if (result.error) {
      console.error(`❌ Migration failed:`);
      console.error(`   Error: ${result.error}`);
      console.error(`\n💡 Possible causes:`);
      console.error(`   1. Table already exists (safe to continue)`);
      console.error(`   2. Database permissions issue`);
      console.error(`   3. Invalid SQL syntax`);
      console.error(`\n   Try running again or check your database manually.`);
      process.exit(1);
    } else {
      console.error(`❌ Unexpected response:`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Response:`, result);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      "❌ Network error during migration:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(`\n💡 Troubleshooting:`);
    console.error(
      `   1. Check if https://cornbelt.co.ke/api.php is accessible`,
    );
    console.error(`   2. Verify your internet connection`);
    console.error(`   3. Check for CORS or firewall issues`);
    process.exit(1);
  }
}

migrate();
