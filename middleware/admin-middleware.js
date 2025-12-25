const isAdminUser = (req  , res , next ) => {
    console.log('Admin middleware executed');
    if (req.userInfo && req.userInfo.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "You are not authorized to access this resource" , success : false , statusCode : 403     });

    }
}

export default isAdminUser;