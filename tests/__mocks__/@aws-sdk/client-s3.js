// Mock AWS S3 client
const S3Client = jest.fn(() => ({
    send: jest.fn(() => Promise.resolve({})),
}));

const PutObjectCommand = jest.fn();
const GetObjectCommand = jest.fn();

module.exports = { S3Client, PutObjectCommand, GetObjectCommand };
