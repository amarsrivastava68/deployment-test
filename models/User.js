import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username:
    {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {

        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // ONLY ALLOW ROLE VALUES TO BE USER OR ADMIN 
        default: 'user' // IF NO ROLE IS PROVIDED , SET IT TO USER
    },
   
} , { timestamps:true });
const User = mongoose.model("User", userSchema);

export default User;