module.exports = {
  apps: [
    {
      name: "cornbelt",
      script: "dist/server/node-build.mjs",
      cwd: "/var/www/cornbelt",
      env: {
        NODE_ENV: "production",
        API_BASE_URL: "https://cornbelt.co.ke",
      },
    },
  ],
};
