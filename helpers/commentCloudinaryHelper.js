// helpers/commentCloudinaryHelper.js
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

// Configure cloudinary (if not already done in your app)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Get resource type based on file extension
const getResourceType = (filePath) => {
    const ext = filePath.split('.').pop().toLowerCase()
    
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
        return 'image'
    } else if (['mp4'].includes(ext)) {
        return 'video'
    } else {
        return 'raw'  // For pdf, doc, docx, xls, xlsx, mp3
    }
}

// Upload single file to cloudinary
export const uploadToCloudinary = async (filePath, folder = 'ticket-comments') => {
    try {
        const resourceType = getResourceType(filePath)
        
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true
        })

        // Delete local file after upload
        fs.unlinkSync(filePath)

        return {
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: resourceType
        }
    } catch (error) {
        // Delete local file if upload fails
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
        throw error
    }
}

// Upload multiple files to cloudinary
export const uploadMultipleToCloudinary = async (files, folder = 'ticket-comments') => {
    try {
        const uploadPromises = files.map(file => uploadToCloudinary(file.path, folder))
        const results = await Promise.all(uploadPromises)
        
        return results.map((result, index) => ({
            url: result.url,
            publicId: result.publicId,
            fileName: files[index].originalname,
            fileType: files[index].mimetype,
            fileSize: files[index].size
        }))
    } catch (error) {
        // Clean up any remaining local files
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path)
            }
        })
        throw error
    }
}

// Delete file from cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        })
        return result
    } catch (error) {
        throw error
    }
}

// Delete multiple files from cloudinary
export const deleteMultipleFromCloudinary = async (attachments) => {
    try {
        const deletePromises = attachments.map(attachment => {
            const resourceType = getResourceTypeFromMime(attachment.fileType)
            return deleteFromCloudinary(attachment.publicId, resourceType)
        })
        await Promise.all(deletePromises)
    } catch (error) {
        console.log('Error deleting files from cloudinary:', error)
    }
}

// Get resource type from mime type
const getResourceTypeFromMime = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return 'raw'
}