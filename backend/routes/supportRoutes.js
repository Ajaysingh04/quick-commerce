import express from 'express';
import { createTicket, getTickets, updateTicketStatus } from '../controllers/supportController.js';

const router = express.Router();

router.post('/', createTicket);
router.get('/', getTickets);
router.put('/:id/status', updateTicketStatus);

export default router;
