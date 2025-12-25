// controllers/comment-controller.js
import Comment from "../models/Comment.js"
import Ticket from "../models/TicketModel.js"
import { 
    uploadMultipleToCloudinary, 
    deleteMultipleFromCloudinary 
} from "../helpers/commentCloudinaryHelper.js"
import fs from 'fs'

// Add a new comment to a ticket (with optional attachments)
export const addComment = async (req, res) => {
    try {
        const { ticketId, comment, isInternal } = req.body

        // Validation
        if (!ticketId || !comment) {
            // Clean up uploaded files if validation fails
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path)
                    }
                })
            }
            return res.status(400).json({
                message: "ticketId and comment are required",
                success: false
            })
        }

        // Check if ticket exists
        const ticket = await Ticket.findById(ticketId)
        if (!ticket) {
            // Clean up uploaded files
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path)
                    }
                })
            }
            return res.status(404).json({
                message: "Ticket not found",
                success: false
            })
        }

        // Upload attachments to cloudinary if files exist
        let attachments = []
        if (req.files && req.files.length > 0) {
            attachments = await uploadMultipleToCloudinary(req.files)
        }

        const newComment = await Comment.create({
            ticketId,
            comment,
            commentedBy: req.userInfo.id,
            isInternal: isInternal === 'true' || isInternal === true,
            attachments
        })

        const populatedComment = await Comment.findById(newComment._id)
            .populate('commentedBy', 'name email')

        return res.status(201).json({
            message: "Comment added successfully",
            data: populatedComment,
            success: true
        })
    } catch (error) {
        console.log(error)
        // Clean up uploaded files on error
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path)
                }
            })
        }
        return res.status(500).json({
            error: error.message,
            success: false,
            message: 'Something went wrong'
        })
    }
}

// Get all comments for a specific ticket
export const getCommentsByTicket = async (req, res) => {
    try {
        const { ticketId } = req.params
        const { page = 1, limit = 50 } = req.query

        // Check if ticket exists
        const ticket = await Ticket.findById(ticketId)
        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
                success: false
            })
        }

        const skip = (parseInt(page) - 1) * parseInt(limit)

        // Build filter based on user role
        const filter = { ticketId }

        // If user is not admin, hide internal comments
        if (!req.userInfo.isAdmin) {
            filter.isInternal = false
        }

        const comments = await Comment.find(filter)
            .populate('commentedBy') // this will give full object of commented by 
             .populate('commentedBy' , 'username email ')  //this will give username email only with id 
            .sort({ createdAt: 1 })  // oldest first for conversation flow
            .skip(skip)
            .limit(parseInt(limit))

        const total = await Comment.countDocuments(filter)

        return res.status(200).json({
            message: "Comments fetched successfully",
            data: comments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            success: false,
            message: 'Something went wrong'
        })
    }
}

// Update a comment
export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params
        const { comment, isInternal } = req.body

        const existingComment = await Comment.findById(commentId)

        if (!existingComment) {
            // Clean up uploaded files
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path)
                    }
                })
            }
            return res.status(404).json({
                message: "Comment not found",
                success: false
            })
        }

        // Check if user is owner or admin
        if (existingComment.commentedBy.toString() !== req.userInfo.id && !req.userInfo.isAdmin) {
            // Clean up uploaded files
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path)
                    }
                })
            }
            return res.status(403).json({
                message: "Not authorized to update this comment",
                success: false
            })
        }

        // Update comment text if provided
        if (comment) {
            existingComment.comment = comment
        }

        // Update isInternal if provided
        if (isInternal !== undefined) {
            existingComment.isInternal = isInternal === 'true' || isInternal === true
        }

        // Upload new attachments if provided
        if (req.files && req.files.length > 0) {
            const newAttachments = await uploadMultipleToCloudinary(req.files)
            existingComment.attachments = [...existingComment.attachments, ...newAttachments]
        }

        await existingComment.save()

        const updatedComment = await Comment.findById(commentId)
            .populate('commentedBy', 'name email')

        return res.status(200).json({
            message: "Comment updated successfully",
            data: updatedComment,
            success: true
        })
    } catch (error) {
        console.log(error)
        // Clean up uploaded files on error
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path)
                }
            })
        }
        return res.status(500).json({
            error: error.message,
            success: false,
            message: 'Something went wrong'
        })
    }
}

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params

        const comment = await Comment.findById(commentId)

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
                success: false
            })
        }

        // Check if user is owner or admin
        if (comment.commentedBy.toString() !== req.userInfo.id && !req.userInfo.isAdmin) {
            return res.status(403).json({
                message: "Not authorized to delete this comment",
                success: false
            })
        }

        // Delete attachments from cloudinary
        if (comment.attachments && comment.attachments.length > 0) {
            await deleteMultipleFromCloudinary(comment.attachments)
        }

        await Comment.findByIdAndDelete(commentId)

        return res.status(200).json({
            message: "Comment deleted successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            success: false,
            message: 'Something went wrong'
        })
    }
}

// Delete a specific attachment from a comment
export const deleteAttachment = async (req, res) => {
    try {
        const { commentId, attachmentId } = req.params

        const comment = await Comment.findById(commentId)

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
                success: false
            })
        }

        // Check if user is owner or admin
        if (comment.commentedBy.toString() !== req.userInfo.id && !req.userInfo.isAdmin) {
            return res.status(403).json({
                message: "Not authorized to delete this attachment",
                success: false
            })
        }

        // Find the attachment
        const attachment = comment.attachments.id(attachmentId)

        if (!attachment) {
            return res.status(404).json({
                message: "Attachment not found",
                success: false
            })
        }

        // Delete from cloudinary
        await deleteMultipleFromCloudinary([attachment])

        // Remove from comment
        comment.attachments.pull(attachmentId)
        await comment.save()

        return res.status(200).json({
            message: "Attachment deleted successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            success: false,
            message: 'Something went wrong'
        })
    }
}