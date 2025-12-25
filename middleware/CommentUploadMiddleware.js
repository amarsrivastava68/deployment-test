import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure uploads folder exists

const uploadDir = './uploads/comments'
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
    }
})

// Allowed file types
const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    // Video
    'video/mp4'
]

const allowedExtensions = [
    '.jpg', '.jpeg', '.png',
    '.pdf', '.doc', '.docx',
    '.xls', '.xlsx',
    '.mp3',
    '.mp4'
]

// File filter function
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true)
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false)
    }
}

// Multer configuration
const CommentUploadMiddleware = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024,  // 50MB max per file
        files: 10  // Maximum 10 files at once
    },
    fileFilter: fileFilter
})

export default CommentUploadMiddleware