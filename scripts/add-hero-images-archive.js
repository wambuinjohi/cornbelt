#!/usr/bin/env node

/**
 * Add isArchived field to hero_slider_images table
 * This enables the archive feature to soft-delete images instead of permanently removing them
 * Usage: node scripts/add-hero-images-archive.js
 */

const API_URL = "https://cornbelt.co.ke/api.php";
const TABLE_NAME = "hero_slider_images";

const alterConfig = {
  alter_table: true,
  actions: [
    {
      type: "ADD",
      name: "isArchived",
      definition: "BOOLEAN DEFAULT 0",
    },
  ],
};

async function addArchiveField() {
  console.log(`🔄 Adding isArchived field to table: ${TABLE_NAME}...`);
  console.log(`📍 API URL: ${API_URL}\n`);

  try {
    const url = new URL(API_URL);
    url.searchParams.append("table", TABLE_NAME);

    console.log(`📤 Sending request to add isArchived field...\n`);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alterConfig),
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
      console.log(`✅ Successfully added isArchived field`);
      console.log(`📝 Response: ${result.success || result.message}`);
      console.log(`\n✨ Migration completed successfully!`);
      console.log(
        `\n💡 Images can now be archived instead of permanently deleted.`,
      );
      console.log(
        `   Archived images can be restored from the Archive tab in the admin panel.`,
      );
      process.exit(0);
    } else if (result.error) {
      const errorMsg = result.error || "Unknown error";
      if (errorMsg.includes("Duplicate column")) {
        console.log(`✅ Column isArchived already exists`);
        console.log(`   Archive feature is ready to use!`);
        process.exit(0);
      }
      console.error(`❌ Failed to add field:`);
      console.error(`   Error: ${errorMsg}`);
      console.error(`\n💡 Possible causes:`);
      console.error(`   1. Column already exists (safe to continue)`);
      console.error(`   2. Database permissions issue`);
      console.error(`   3. Table doesn't exist`);
      process.exit(1);
    } else {
      console.error(`❌ Unexpected response:`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Response:`, result);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      "❌ Network error:",
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

addArchiveField();
