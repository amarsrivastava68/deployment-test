import cloudinary from "../config/CloudinaryConfig.js";

export const uploadImage = async (filepath) => {

  try {
    console.log("Uploading Image" , filepath);
    const result = await cloudinary.uploader.upload(filepath)
    return {
        url: result.url,
        public_id:result.public_id
    }
  }
  catch(err){
      console.log("Error in uploading image",err);
  }
}

