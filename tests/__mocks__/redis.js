// Mock Redis client
module.exports = {
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve("OK")),
};
