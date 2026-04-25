// Mock AWS S3 presigner
const getSignedUrl = jest.fn(() =>
    Promise.resolve("https://s3.amazonaws.com/test-bucket/test-file.pdf")
);

module.exports = { getSignedUrl };
