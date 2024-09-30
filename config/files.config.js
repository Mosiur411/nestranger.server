const fs = require("fs")
const cloudinary = require('cloudinary')
const sharp = require("sharp")
const path = require('path');


const uploadToCloudinary = async (locaFilePath, folder) => {
  const filePathOnCloudinary = folder + "/" + locaFilePath
  return cloudinary.uploader
    .upload(locaFilePath, { public_id: filePathOnCloudinary })
    .then((result) => {
      fs.unlinkSync(locaFilePath)
      return result.url
    })
    .catch((error) => {
      if (fs.existsSync(locaFilePath)) fs.unlinkSync(locaFilePath)
    })
}
const compressImage = async (filePath) => {
  const compressedImagePath = filePath.replace(/(\.\w+)$/, '-nestranger$1');
  try {
     await sharp(filePath)
          .resize(800)
          .jpeg({ quality: 70 })
          .toFile(compressedImagePath);
      const fileName = path.basename(compressedImagePath);
      return `http://localhost:5001/uploads/${fileName}`;
  } catch (error) {
      throw new Error(`Failed to compress image: ${error.message}`);
  }
};



module.exports = {
  uploadToCloudinary,compressImage
}