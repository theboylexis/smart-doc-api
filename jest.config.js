const path = require("path");

module.exports = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
    setupFiles: ["./tests/setup.js"],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    moduleNameMapper: {
        // Map local config modules to mocks
        "^.*/config/redis$": path.resolve(__dirname, "tests/__mocks__/redis.js"),
        "^.*/config/cloudinary$": path.resolve(__dirname, "tests/__mocks__/cloudinary.js"),
    },
};
