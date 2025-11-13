#!/usr/bin/env node
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const API_URL = process.env.API_URL || 'http://localhost:8080';

async function seedFooterSettings() {
  try {
    console.log('Creating footer_settings table...');
    
    // Create table
    const createTableResponse = await fetch(`${API_URL}/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'footer_settings',
        create_table: true,
        columns: {
          id: 'INT PRIMARY KEY AUTO_INCREMENT',
          phone: 'VARCHAR(255) NOT NULL',
          email: 'VARCHAR(255) NOT NULL',
          location: 'VARCHAR(255) NOT NULL',
          facebookUrl: 'VARCHAR(255)',
          instagramUrl: 'VARCHAR(255)',
          twitterUrl: 'VARCHAR(255)',
          updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        }
      })
    });

    const createResult = await createTableResponse.json();
    console.log('Table creation result:', createResult);

    // Insert default footer settings
    console.log('Inserting default footer settings...');
    const insertResponse = await fetch(`${API_URL}/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'footer_settings',
        phone: '+254 (0) XXX XXX XXX',
        email: 'info@cornbelt.co.ke',
        location: 'Kenya',
        facebookUrl: 'https://facebook.com',
        instagramUrl: 'https://instagram.com',
        twitterUrl: 'https://twitter.com'
      })
    });

    const insertResult = await insertResponse.json();
    console.log('Insert result:', insertResult);

    if (insertResult.success) {
      console.log('✅ Footer settings table created and seeded successfully!');
      process.exit(0);
    } else {
      console.error('❌ Failed to insert footer settings:', insertResult);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error seeding footer settings:', error);
    process.exit(1);
  }
}

seedFooterSettings();
