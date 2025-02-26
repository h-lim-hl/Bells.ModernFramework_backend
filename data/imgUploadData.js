async function uploadToUploadcare (fileBuffer, filename) {
  const UPLOADCARE_BASE_URL = "https://ucarecdn.com/";
  try {
    const formData = new FormData();
    formData.append("file", fileBuffer, filename);

    const response = await axios.post("http://upload.uploadcare.com/base/", formData, {
      "headers" : {
        "Authorization" : `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_PRIVATE_KEY}`,
        "Content-Type" : "multipart/formdata"
      }
    });
    console.log("Uploadcare response: ", response);
    return { imageUrl: `${UPLOADCARE_BASE_URL}/${response.data.filename}` };
  } catch (err) {
    console.error("Error uploading to upload care: ", err);
    throw err;
  }
}

module.exports = {
  uploadToUploadcare
};