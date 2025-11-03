#!/usr/bin/env node

/**
 * Comprehensive API Insert Debugging Script
 * Tests different ways of sending data to the API to identify the issue
 * Usage: node scripts/debug-api-insert.js
 */

const API_URL = "https://cornbelt.co.ke/api.php";
const TABLE_NAME = "visitor_tracking";

const testData = {
  page_url: "/debug-test",
  device_type: "Debug",
  screen_resolution: "1920x1080",
  screen_width: 1920,
  screen_height: 1080,
  browser_language: "en",
  timezone: "UTC",
  timezone_offset: 0,
  referrer: "debug",
  connection_type: "test",
  memory: "8GB",
  processor_cores: 4,
  platform: "Linux",
  session_id: `debug-${Date.now()}`,
  viewport_width: 1920,
  viewport_height: 1080,
  color_depth: 24,
  pixel_depth: 24,
  local_time: new Date().toLocaleString(),
  user_agent: "Debug Agent/1.0",
};

async function testVariation(name, url, body) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Test: ${name}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`URL: ${url}`);
  console.log(`Body fields: ${Object.keys(body).length}`);
  console.log(`Body size: ${JSON.stringify(body).length} bytes\n`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);

    const responseText = await response.text();
    console.log(`Response Length: ${responseText.length} bytes`);
    
    if (responseText) {
      console.log(`Response Body:`);
      try {
        const json = JSON.parse(responseText);
        console.log(JSON.stringify(json, null, 2));
      } catch {
        console.log(responseText);
      }
    } else {
      console.log("(empty response body)");
    }

    return response.ok;
  } catch (error) {
    console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function runTests() {
  console.log(`\n${"*".repeat(60)}`);
  console.log(`API INSERT DEBUGGING TOOL`);
  console.log(`${"*".repeat(60)}`);
  console.log(`API: ${API_URL}`);
  console.log(`Table: ${TABLE_NAME}`);
  console.log(`Test Data Fields: ${Object.keys(testData).length}\n`);

  const results = [];

  // Test 1: With table in URL
  const url1 = new URL(API_URL);
  url1.searchParams.append("table", TABLE_NAME);
  results.push(
    await testVariation(
      "Table in URL query parameter",
      url1.toString(),
      testData
    )
  );

  // Test 2: Minimal data
  const minimalData = {
    page_url: "/debug",
    device_type: "Debug",
    session_id: `min-${Date.now()}`,
  };
  const url2 = new URL(API_URL);
  url2.searchParams.append("table", TABLE_NAME);
  results.push(
    await testVariation(
      "Minimal data (3 fields)",
      url2.toString(),
      minimalData
    )
  );

  // Test 3: Without table parameter (to see if API requires it)
  results.push(
    await testVariation(
      "Without table parameter",
      API_URL,
      { ...testData, table: TABLE_NAME }
    )
  );

  // Test 4: With underscore conversion
  const dataWithoutUnderscores = {};
  Object.entries(testData).forEach(([key, value]) => {
    dataWithoutUnderscores[key] = value;
  });
  const url4 = new URL(API_URL);
  url4.searchParams.append("table", TABLE_NAME);
  results.push(
    await testVariation(
      "With converted field names",
      url4.toString(),
      dataWithoutUnderscores
    )
  );

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("SUMMARY");
  console.log(`${"=".repeat(60)}`);
  console.log(`Test 1 (URL param): ${results[0] ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Test 2 (Minimal): ${results[1] ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Test 3 (No param): ${results[2] ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Test 4 (Converted): ${results[3] ? "✅ PASS" : "❌ FAIL"}`);

  if (results.some((r) => r)) {
    console.log(
      `\n✅ At least one test passed! Use that method in the frontend.`
    );
  } else {
    console.log(`\n❌ All tests failed. Check your API logs for details:`);
    console.log(`   - PHP error_log`);
    console.log(`   - MySQL error log`);
    console.log(`   - API implementation in api.php`);
  }
}

runTests();
