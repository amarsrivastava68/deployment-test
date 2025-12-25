// routes/ticket-routes.js
import express from 'express'
import authMiddleware from '../middleware/auth-middleware.js'
import isAdminUser from '../middleware/admin-middleware.js'
import {
    createTicket,
    getAllTickets,
    getTicketById,
    updateTicket,
    deleteTicket,
    getMyTickets
} from '../controllers/TicketController.js'

const TicketRouter = express.Router()

// Create ticket (any authenticated user)
TicketRouter.post('/create', authMiddleware, createTicket)

// Get my tickets
TicketRouter.get('/my-tickets', authMiddleware, getMyTickets)

// Get all tickets (admin only)
TicketRouter.get('/all', authMiddleware, isAdminUser, getAllTickets)

// Get single ticket by ID
TicketRouter.get('/:ticketId', authMiddleware, getTicketById)

// Update ticket (admin only)
TicketRouter.put('/:ticketId', authMiddleware, isAdminUser, updateTicket)

// Delete ticket (admin only)
TicketRouter.delete('/:ticketId', authMiddleware, isAdminUser, deleteTicket)

export default TicketRouter