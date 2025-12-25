
import express from "express";
import { changePassword, LoginUser, RegisterUser } from "../controllers/auth-controller.js";
import authMiddleware from "../middleware/auth-middleware.js";


const authRoutes = express.Router()

authRoutes.post('/login', LoginUser);
authRoutes.post('/register', RegisterUser)
authRoutes.post('/change-password', authMiddleware , changePassword)

export default authRoutes;


