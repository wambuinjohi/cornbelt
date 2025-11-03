#!/usr/bin/env node

/**
 * API Connectivity Test Script
 * Tests if your API is accessible and properly configured
 * Usage: node scripts/test-api.js
 */

const API_URL = "https://cornbelt.co.ke/api.php";

async function testAPI() {
  console.log("🔍 Testing API connectivity...\n");

  // Test 1: Basic connectivity
  console.log("1️⃣  Testing basic connectivity...");
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log(`   ✅ API is reachable (Status: ${response.status})\n`);
  } catch (error) {
    console.log(
      `   ❌ Cannot reach API: ${error instanceof Error ? error.message : String(error)}\n`
    );
    process.exit(1);
  }

  // Test 2: Attempt to fetch from visitor_tracking table
  console.log("2️⃣  Testing visitor_tracking table access...");
  try {
    const url = new URL(API_URL);
    url.searchParams.append("table", "visitor_tracking");

    const response = await fetch(url.toString(), { method: "GET" });
    const data = await response.json();

    if (response.ok) {
      console.log(`   ✅ Table exists and is accessible`);
      console.log(`   📊 Records found: ${Array.isArray(data) ? data.length : 0}\n`);
    } else {
      console.log(`   ⚠️  Table might not exist. Error: ${data.error}\n`);
      console.log("   💡 Run the migration script first:");
      console.log("      node scripts/migrate-visitor-tracking.js\n");
    }
  } catch (error) {
    console.log(
      `   ❌ Error: ${error instanceof Error ? error.message : String(error)}\n`
    );
  }

  // Test 3: Test creating a sample record
  console.log("3️⃣  Testing insert operation...");
  try {
    const url = new URL(API_URL);
    url.searchParams.append("table", "visitor_tracking");

    const testData = {
      page_url: "/test",
      device_type: "Test",
      screen_resolution: "1920x1080",
      screen_width: 1920,
      screen_height: 1080,
      browser_language: "en",
      timezone: "UTC",
      timezone_offset: 0,
      referrer: "test",
      connection_type: "test",
      memory: "8GB",
      processor_cores: 4,
      platform: "test",
      session_id: `test-${Date.now()}`,
      viewport_width: 1920,
      viewport_height: 1080,
      color_depth: 24,
      pixel_depth: 24,
      local_time: new Date().toLocaleString(),
      user_agent: "Test Agent",
    };

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log(`   ✅ Successfully inserted test record (ID: ${result.id})\n`);
    } else {
      console.log(`   ❌ Insert failed: ${result.error}\n`);
    }
  } catch (error) {
    console.log(
      `   ❌ Error: ${error instanceof Error ? error.message : String(error)}\n`
    );
  }

  console.log("✨ API test complete!");
}

testAPI();
