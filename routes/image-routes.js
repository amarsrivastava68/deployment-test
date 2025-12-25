import express from 'express'
import authMiddleware from '../middleware/auth-middleware.js'
import isAdminUser from '../middleware/admin-middleware.js'
import UploadMiddlwware from '../middleware/UploadMiddlwware.js'
import { uploadImageController } from '../controllers/image-controller.js'
const ImageUploadRouter = express.Router()

ImageUploadRouter.post('/upload'  , authMiddleware , isAdminUser , UploadMiddlwware.single('image')  ,  uploadImageController)

export default ImageUploadRouter