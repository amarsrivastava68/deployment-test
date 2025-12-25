// controllers/ticket-controller.js
import Ticket from "../models/TicketModel.js"
import { generateTicketNumber } from "../helpers/TicketNumberHelper.js"

// Create a new ticket
export const createTicket = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body
        
        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required",
                success: false
            })
        }

        const ticketNumber = await generateTicketNumber()

        const newTicket = await Ticket.create({
            ticketNumber,
            title,
            description,
            category: category || 'support',
            priority: priority || 'medium',
            createdBy: req.userInfo.id
        })

        const populatedTicket = await Ticket.findById(newTicket._id)
            .populate('createdBy', 'username email role createdAt')

        return res.status(201).json({
            message: "Ticket created successfully",
            data: populatedTicket,
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error,
            success: false,
            message: 'Something went wrong'
        })
    }
}

// Get all tickets (with optional filters)
export const getAllTickets = async (req, res) => {
    try {
        const { status, priority, category, page = 1, limit = 10 } = req.query
        
        // const filter = {}
        // if (status) filter.status = status
        // if (priority) filter.priority = priority
        // if (category) filter.category = category

        // const skip = (parseInt(page) - 1) * parseInt(limit)

        // const tickets = await Ticket.find(filter)
        //     .populate('createdBy', 'name email')
        //     .populate('assignedTo', 'name email')
        //     .sort({ createdAt: -1 })
        //     .skip(skip)
        //     .limit(parseInt(limit))

        // const total = await Ticket.countDocuments(filter)


        const skip = (Number(page) -1 ) * Number(limit)
        const filter = {}
        if (status) filter.status = status
        if (priority) filter.priority = priority
        if (category ) filter.category = category

        const tickets = await Ticket.find(filter).populate('createdBy' , 'name email').populate('assignedTo','name email').sort({createdAt:-1}).skip(skip).limit(Number(limit))
        
        return res.status(200).json({
            message: "Tickets fetched successfully",
            data: tickets,
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
            error: error,
            success: false,
            message: 'Something went wrong'
        })
    }
}

// Get single ticket by ID
export const getTicketById = async (req, res) => {
    try {
        const { ticketId } = req.params

        const ticket = await Ticket.findById(ticketId)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Ticket fetched successfully",
            data: ticket,
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error,
            success: false,
            message: 'Something went wrong'
        })
    }
}

// Update ticket
export const updateTicket = async (req, res) => {
    try {
        const { ticketId } = req.params
        const { title, description, category, priority, status, assignedTo } = req.body

        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
                success: false
            })
        }

        // Update fields if provided
        if (title) ticket.title = title
        if (description) ticket.description = description
        if (category) ticket.category = category
        if (priority) ticket.priority = priority
        if (status) ticket.status = status
        if (assignedTo) ticket.assignedTo = assignedTo

        await ticket.save()

        const updatedTicket = await Ticket.findById(ticketId)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')

        return res.status(200).json({
            message: "Ticket updated successfully",
            data: updatedTicket,
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error,
            success: false,
            message: 'Something went wrong'
        })
    }
}

// Delete ticket
export const deleteTicket = async (req, res) => {
    try {
        const { ticketId } = req.params

        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
                success: false
            })
        }

        await Ticket.findByIdAndDelete(ticketId)

        return res.status(200).json({
            message: "Ticket deleted successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error,
            success: false,
            message: 'Something went wrong'
        })
    }
}

// Get my tickets (created by logged in user)
export const getMyTickets = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query
        
        const filter = { createdBy: req.userInfo.id }
        if (status) filter.status = status

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const tickets = await Ticket.find(filter)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const total = await Ticket.countDocuments(filter)

        return res.status(200).json({
            message: "Tickets fetched successfully",
            data: tickets,
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
            error: error,
            success: false,
            message: 'Something went wrong'
        })
    }
}