#!/usr/bin/env node

// Add geolocation columns to visitor_tracking table for IP-to-location enrichment

import http from 'http';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  try {
    console.log('Adding geolocation columns to visitor_tracking table...');

    const alterPayload = {
      table: 'visitor_tracking',
      alter_table: true,
      actions: [
        {
          type: 'ADD',
          name: 'geolocation_country',
          definition: 'VARCHAR(100) NULL AFTER geolocation_longitude',
        },
        {
          type: 'ADD',
          name: 'geolocation_country_code',
          definition: 'VARCHAR(5) NULL AFTER geolocation_country',
        },
        {
          type: 'ADD',
          name: 'geolocation_city',
          definition: 'VARCHAR(100) NULL AFTER geolocation_country_code',
        },
        {
          type: 'ADD',
          name: 'geolocation_timezone',
          definition: 'VARCHAR(100) NULL AFTER geolocation_city',
        },
      ],
    };

    const result = await makeRequest('POST', '/api.php', alterPayload);

    if (result.status === 200 && result.body.success) {
      console.log('✓ Successfully added geolocation columns to visitor_tracking table');
      console.log('  Columns added:');
      console.log('  - geolocation_country (VARCHAR 100)');
      console.log('  - geolocation_country_code (VARCHAR 5)');
      console.log('  - geolocation_city (VARCHAR 100)');
      console.log('  - geolocation_timezone (VARCHAR 100)');
      process.exit(0);
    } else {
      console.error('✗ Failed to add columns:', result.body);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

run();
