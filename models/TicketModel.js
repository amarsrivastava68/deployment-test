// models/Ticket.js
import mongoose from 'mongoose'

const TicketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['bug', 'feature', 'support', 'inquiry', 'other'],
        default: 'support'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    attachments: [{
        url: String,
        publicId: String,
        fileName: String
    }]
}, { timestamps: true })

// Index for faster queries
TicketSchema.index({ ticketNumber: 1 })
TicketSchema.index({ status: 1, createdAt: -1 })

const Ticket = mongoose.model("Ticket", TicketSchema)
export default Ticket