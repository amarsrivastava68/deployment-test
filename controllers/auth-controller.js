
import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
//register controller
import dotenv from 'dotenv'

dotenv.config()

export const RegisterUser = async (req , res )=> {
  try {

    const {username,email,password,role}= req.body;
    //check if user already exists (either email OR username)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({
        success : false,
        message: 'A user with that email or usern123ssame already exists'
      });
    }


    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create and save the new user
    const newUser = new User({ username, email, password: hashedPassword, role : role || 'user' });
    await newUser.save();

    // sign JWT
    const token = jwt.sign({ id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET , { expiresIn: '1d' });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role },
      token
    });
  } catch (error) {
    console.log('error in registering user' , error)
    return res.status(500).json({
        success : false,
        message: 'something went wrong' ,
        error : error
    })   
  }
}


//login controller

export const LoginUser = async (req , res)=> {
    try {
        const { username , password} = req.body ;
        // check if user exists 
        const existingUser = await User.findOne({ username : username });
        if (!existingUser) {
            return res.status(404).json({
                success : false,
                message: 'User not found. Please register first.'
            });
        }
        // compare passwords
        const isPasswordCorrect = await bcrypt.compare(password,  existingUser.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success : false,
                message: 'Invalid credentials. Please try again.'
            });
        }
        // sign JWT
        const token = jwt.sign(
            { id: existingUser._id, username: existingUser.username, email: existingUser.email, role: existingUser.role }, process.env.JWT_SECRET , { expiresIn: '30m' } )
        return res.status(200).json({
            success : true,
            message: 'User logged in successfully',
            user: { id: existingUser._id, username: existingUser.username, email: existingUser.email, role: existingUser.role },
            token
        });
        
    } catch (error) {
        console.log('error in registering user' , error)
    return {
        success : false,
        message: 'something went wrong'
    }   
        
    }
}

export const changePassword  = async(req,res)=>{
    try {
        const { oldPassword , newPassword } = req.body ;
        console.log(req.userInfo , 'line 98')
        
        const userId = req.userInfo.id;
        console.log(userId)
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found'
            })
        }
        const isPasswordCorrect = await bcrypt.compare(oldPassword,user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({
                success:false,
                message:'Incorrect Password'
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword,salt);
        user.password = hashedNewPassword;
        await user.save();
        return res.status(200).json({
            success:true,
            message:'password changed successfully'
        })  
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong'
        });
    } 
    
}