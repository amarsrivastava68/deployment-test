
import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import isAdminUser from "../middleware/admin-middleware.js";


const adminRoutes = express.Router()

adminRoutes.get('/welcome', authMiddleware , isAdminUser ,  (req, res) => {
    res.status(200).json({ message: "Welcome to the Admin Page!"
        , userInfo: req.userInfo
     });
});

export default adminRoutes;
