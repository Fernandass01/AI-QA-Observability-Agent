const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests",

    reporter: [
        ["list"],
        ["./playwright-observability-reporter.js"],
    ],

    use: {
        browserName: "chromium",
        headless: true,
    },
});