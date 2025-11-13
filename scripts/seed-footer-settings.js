#!/usr/bin/env node

const http = require("http");

const data = JSON.stringify({
  table: "footer_settings",
  phone: "+254 (0) XXX XXX XXX",
  email: "info@cornbelt.co.ke",
  location: "Kenya",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  twitterUrl: "https://twitter.com",
});

const options = {
  hostname: "localhost",
  port: 8080,
  path: "/api.php",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log("Response:", body);
    process.exit(0);
  });
});

req.on("error", (e) => {
  console.error("Error:", e.message);
  process.exit(1);
});

req.write(data);
req.end();
