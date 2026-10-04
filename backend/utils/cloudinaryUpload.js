import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer, folder = "bidswift/items") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(fileBuffer);
  });
};

export default uploadToCloudinary;
