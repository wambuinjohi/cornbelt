#!/usr/bin/env node

/**
 * Fix session_id UNIQUE constraint
 * The session_id should NOT be unique because multiple page visits can have the same session
 * Usage: node scripts/fix-session-id-constraint.js
 */

const API_URL = "https://cornbelt.co.ke/api.php";
const TABLE_NAME = "visitor_tracking";

const alterConfig = {
  alter_table: true,
  actions: [
    {
      type: "DROP",
      name: "session_id"
    },
    {
      type: "ADD",
      name: "session_id",
      definition: "VARCHAR(255)"
    }
  ]
};

async function fixConstraint() {
  console.log(`🔄 Fixing session_id UNIQUE constraint on table: ${TABLE_NAME}...`);
  console.log(`📍 API URL: ${API_URL}\n`);

  try {
    const url = new URL(API_URL);
    url.searchParams.append("table", TABLE_NAME);

    console.log(`📤 Sending request to remove UNIQUE constraint...\n`);

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
      process.exit(1);
    }

    if (response.ok && (result.success || result.message)) {
      console.log(`✅ Successfully fixed session_id constraint`);
      console.log(`📝 Response: ${result.success || result.message}`);
      console.log(`\n✨ Constraint fix completed successfully!`);
      console.log(`\n💡 Now visitors can have multiple records with the same session_id,`);
      console.log(`   allowing proper tracking of multiple page visits per session.`);
      process.exit(0);
    } else if (result.error) {
      console.error(`❌ Failed to fix constraint:`);
      console.error(`   Error: ${result.error}`);
      process.exit(1);
    } else {
      console.error(`❌ Unexpected response:`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Response:`, result);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Network error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

fixConstraint();
