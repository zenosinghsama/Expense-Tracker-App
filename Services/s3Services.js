const AWS = require("aws-sdk");

const uploadToS3 = async (data, filename) => {
    try {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
  
    let s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
    });
  
    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL: "public-read"
    };
    const { Location: fileUrl } = await s3bucket.upload(params).promise();
    return fileUrl;
}
catch(err) {
    console.log("ERROR IN UPLOADING EXPENSE DATA TO S3", err)
}
}
  
  module.exports = {
    uploadToS3
  }