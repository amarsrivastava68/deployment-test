
import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";


const homeRoutes = express.Router()

homeRoutes.get('/welcome', authMiddleware , (req, res) => {
    res.status(200).json({ message: "Welcome to the Home Page!"
        , userInfo: req.userInfo
     });
});

export default homeRoutes;
