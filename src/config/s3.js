const { S3Client } = require("@aws-sdk/client-s3");

const getS3Client = () =>
    new S3Client({
        region: 'us-east-1',
        forcePathStyle: true,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

const getBucketName = () => process.env.S3_BUCKET_NAME;

module.exports = { getS3Client, getBucketName };
