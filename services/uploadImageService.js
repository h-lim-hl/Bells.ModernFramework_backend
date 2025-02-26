const ImgUploadData = require("imgUploadData");

async function uploadImage(buffer, filename) {
  return await ImgUploadData.uploadToUploadcare(buffer, filename);
}

module.exports = {
  uploadImage
}