#!/usr/bin/env node

// Filter out the middleware deprecation warning from next-pwa
const { spawn } = require("child_process");

const port = process.env.PORT || "3002";
const args = ["dev", "--webpack", "-p", port];

const child = spawn("next", args, {
  shell: true,
  env: {
    ...process.env,
    PORT: port,
  },
});

// Filter stdout to remove the middleware warning
child.stdout.on("data", (data) => {
  const message = data.toString();
  // Filter out the specific middleware deprecation warning
  if (
    !message.includes('"middleware" file convention is deprecated') &&
    !(message.includes("middleware") && message.includes("proxy") && message.includes("deprecated"))
  ) {
    process.stdout.write(data);
  }
});

// Filter stderr to remove the middleware warning
child.stderr.on("data", (data) => {
  const message = data.toString();
  // Filter out the specific middleware deprecation warning
  if (
    !message.includes('"middleware" file convention is deprecated') &&
    !(message.includes("middleware") && message.includes("proxy") && message.includes("deprecated"))
  ) {
    process.stderr.write(data);
  }
});

child.on("close", (code) => {
  process.exit(code || 0);
});

