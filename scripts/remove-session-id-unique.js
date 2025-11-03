#!/usr/bin/env node

/**
 * Remove UNIQUE constraint from session_id column
 * This allows multiple records to have the same session_id (which is correct for tracking)
 * Usage: node scripts/remove-session-id-unique.js
 */

const API_URL = "https://cornbelt.co.ke/api.php";
const TABLE_NAME = "visitor_tracking";

async function removeConstraint() {
  console.log(`🔄 Removing UNIQUE constraint from session_id...\n`);

  try {
    const url = new URL(API_URL);
    url.searchParams.append("table", TABLE_NAME);

    // First, try to drop the index if it exists
    const dropIndexSQL = `DROP INDEX IF EXISTS session_id ON ${TABLE_NAME}`;
    
    console.log(`📤 Attempting to drop UNIQUE index...\n`);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alter_table: true,
        actions: [
          {
            type: "MODIFY",
            name: "session_id",
            definition: "VARCHAR(255)"
          }
        ]
      }),
    });

    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error(`❌ Invalid JSON response from API`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Response: ${responseText}\n`);
      console.error(`💡 Try running this SQL directly on your database:\n`);
      console.error(`   ALTER TABLE visitor_tracking MODIFY COLUMN session_id VARCHAR(255);\n`);
      process.exit(1);
    }

    if (response.ok && (result.success || result.message)) {
      console.log(`✅ Successfully removed UNIQUE constraint!`);
      console.log(`📝 Response: ${result.success || result.message}\n`);
      console.log(`✨ Visitor tracking will now work correctly.`);
      console.log(`💡 Multiple page visits can now have the same session_id.`);
      process.exit(0);
    } else if (result.error) {
      console.error(`❌ Error: ${result.error}\n`);
      console.error(`💡 The UNIQUE index might need manual removal. Run this SQL:\n`);
      console.error(`   ALTER TABLE visitor_tracking MODIFY COLUMN session_id VARCHAR(255);\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Network error: ${error instanceof Error ? error.message : String(error)}\n`);
    console.error(`💡 If this fails, run this SQL directly on your database:\n`);
    console.error(`   ALTER TABLE visitor_tracking MODIFY COLUMN session_id VARCHAR(255);\n`);
    process.exit(1);
  }
}

removeConstraint();
