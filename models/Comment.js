// models/Comment.js
import mongoose from 'mongoose'

const AttachmentSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        default: 0
    }
}, { _id: true })

const CommentSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attachments: [AttachmentSchema],
    isInternal: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// Index for faster ticket-wise queries
CommentSchema.index({ ticketId: 1, createdAt: 1 })

const Comment = mongoose.model("Comment", CommentSchema)
export default Comment