// Mock Cloudinary client
module.exports = {
    uploader: {
        upload: jest.fn(() =>
            Promise.resolve({
                secure_url: "https://res.cloudinary.com/test/raw/upload/test-file.pdf",
            })
        ),
    },
};
