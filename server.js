import dotenv from 'dotenv'
import express from 'express'
import connectToDB from './database/db.js';
import authRoutes from './routes/auth-routes.js';
import homeRoutes from './routes/home-routes.js';
import adminRoutes from './routes/admin-routes.js';
import ImageUploadRouter from './routes/image-routes.js';
import TicketRouter from './routes/ticket-routes.js';
import CommentRouter from './routes/comment-routes.js';
connectToDB();
dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/image' , ImageUploadRouter)
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tickets',TicketRouter);
app.use('/api/comments' , CommentRouter)
const PORT = process.env.PORT ;


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

