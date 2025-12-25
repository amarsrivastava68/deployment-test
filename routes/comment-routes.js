// routes/comment-routes.js
import express from 'express'
import authMiddleware from '../middleware/auth-middleware.js'
import CommentUploadMiddleware from '../middleware/CommentUploadMiddleware.js'
import {
    addComment,
    getCommentsByTicket,
    updateComment,
    deleteComment,
    deleteAttachment
} from '../controllers/comment-controller.js'

const CommentRouter = express.Router()

// Add comment with optional attachments (max 10 files)
CommentRouter.post(
    '/add',
    authMiddleware,
    CommentUploadMiddleware.array('attachments', 10),
    addComment
)

// Get all comments for a ticket
CommentRouter.get(
    '/ticket/:ticketId',
    authMiddleware,
    getCommentsByTicket
)

// Update comment (can add more attachments)
CommentRouter.put(
    '/:commentId',
    authMiddleware,
    CommentUploadMiddleware.array('attachments', 10),
    updateComment
)

// Delete comment
CommentRouter.delete(
    '/:commentId',
    authMiddleware,
    deleteComment
)

// Delete specific attachment from comment
CommentRouter.delete(
    '/:commentId/attachment/:attachmentId',
    authMiddleware,
    deleteAttachment
)

export default CommentRouter