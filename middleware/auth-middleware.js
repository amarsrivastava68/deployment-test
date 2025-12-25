import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    console.log('Auth middleware executed');
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' , statusCode : 401 });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing' , statusCode : 401 });
    }
    try {
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
        req.userInfo = decodedUser; // Attach user info to request object
    } catch (error) {
        return res.status(500).json({ message: 'Invalid or expired token' , statusCode : 500 , success : false });
    }
    next();
}

export default authMiddleware;