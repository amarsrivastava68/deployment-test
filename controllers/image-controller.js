import Image from "../models/Image.js";
import { uploadImage } from "../helpers/cloudinaryHelpers.js";

export const uploadImageController = async (req, res) => {
    try {
        console.log(req.file , 'from image controller')
      
        if (!req.file) {
            return res.status(400).json({ message: "no file found", success: false });
        }

        const { url, public_id } = await uploadImage(req.file.path);

        // upload the image url and image id along with the uploader ID TO data base 
        const newlyUploadedImage = await Image.create({
            url,
            publicId : public_id,
            uploadedBy: req.userInfo.id
        })
        return res.status(201).json({ message: "image uploaded successfully", newlyUploadedImage, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error : error, success: false, message: 'something went wrong' });
    }
}