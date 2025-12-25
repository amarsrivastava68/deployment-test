import Ticket from "../models/TicketModel.js"

export const generateTicketNumber = async () => {
    const today = new Date()
    const year = today.getFullYear().toString().slice(-2)
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    const prefix = `TKT${year}${month}${day}`
    
    // Find today's last ticket
    const lastTicket = await Ticket.findOne({
        ticketNumber: { $regex: `^${prefix}` }
    }).sort({ ticketNumber: -1 })
    
    let sequence = 1
    if (lastTicket) {
        const lastSequence = parseInt(lastTicket.ticketNumber.slice(-4))
        sequence = lastSequence + 1
    }
    
    return `${prefix}${String(sequence).padStart(4, '0')}`
}

