#!/usr/bin/env node

/**
 * Test Visitor Insert Script
 * Tests inserting a simple visitor record to diagnose API errors
 * Usage: node scripts/test-visitor-insert.js
 */

const API_URL = "https://cornbelt.co.ke/api.php";
const TABLE_NAME = "visitor_tracking";

async function testInsert(dataLevel = 1) {
  console.log(`\n🔄 Testing visitor insert (Level ${dataLevel})...\n`);

  const testData = {
    1: {
      // Minimal data
      page_url: "/test",
      device_type: "Desktop",
      screen_resolution: "1920x1080",
      browser_language: "en",
      timezone: "UTC",
      referrer: "direct",
      connection_type: "4g",
      session_id: `test-${Date.now()}`,
      local_time: new Date().toLocaleString(),
    },
    2: {
      // Add more essential fields
      page_url: "/test",
      device_type: "Desktop",
      screen_resolution: "1920x1080",
      screen_width: 1920,
      screen_height: 1080,
      browser_language: "en",
      timezone: "UTC",
      timezone_offset: 0,
      referrer: "direct",
      connection_type: "4g",
      memory: "8GB",
      processor_cores: 4,
      platform: "Linux",
      session_id: `test-${Date.now()}`,
      viewport_width: 1920,
      viewport_height: 1080,
      color_depth: 24,
      pixel_depth: 24,
      local_time: new Date().toLocaleString(),
    },
    3: {
      // Full data
      page_url: "/test",
      previous_page: null,
      user_agent: "Mozilla/5.0",
      device_type: "Desktop",
      screen_resolution: "1920x1080",
      screen_width: 1920,
      screen_height: 1080,
      browser_language: "en",
      timezone: "UTC",
      timezone_offset: 0,
      referrer: "direct",
      connection_type: "4g",
      memory: "8GB",
      processor_cores: 4,
      platform: "Linux",
      session_id: `test-${Date.now()}`,
      geolocation_latitude: null,
      geolocation_longitude: null,
      geolocation_accuracy: null,
      viewport_width: 1920,
      viewport_height: 1080,
      color_depth: 24,
      pixel_depth: 24,
      do_not_track: null,
      local_time: new Date().toLocaleString(),
      ip_address: "127.0.0.1",
    },
  };

  const data = testData[dataLevel];

  try {
    const url = new URL(API_URL);
    url.searchParams.append("table", TABLE_NAME);

    console.log(`📤 Sending data fields: ${Object.keys(data).join(", ")}\n`);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📝 Response Body: ${responseText || "(empty)"}\n`);

    if (responseText) {
      try {
        const result = JSON.parse(responseText);
        if (result.success) {
          console.log(`✅ SUCCESS! Record inserted with ID: ${result.id}`);
          console.log(
            `\n💡 This level of data works. Try the full tracking now.`,
          );
          return true;
        } else if (result.error) {
          console.log(`❌ Insert failed with error: ${result.error}`);

          if (dataLevel < 3) {
            console.log(`\n🔄 Trying with more fields...\n`);
            await testInsert(dataLevel + 1);
          } else {
            console.log(
              `\n💡 The error seems to be with the data format or MySQL configuration.`,
            );
            console.log(`\n🛠️  Check your API logs at the server and verify:`);
            console.log(
              `   1. session_id column doesn't have UNIQUE constraint`,
            );
            console.log(`   2. All column definitions match the INSERT data`);
            console.log(`   3. No other constraints are blocking the insert`);
          }
          return false;
        }
      } catch {
        console.log(`❌ Could not parse API response as JSON`);
        return false;
      }
    }
  } catch (error) {
    console.error(
      `❌ Network error: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}

testInsert(1);
