import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utilis.js";
import cloudinary from "../lib/cloudinary.js";

export const signup=async (req,res)=>{
    const {fullName,email,password}=req.body;
    try{
        if(!fullName || !email || !password){
            return res.status(400).json({message:"Important fields are required"});
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be atleast 6 characters long"});
        }
        const user=await User.findOne({email});

        if(user) return res.status(400).json({message:"Email already exists"});

        const Hashpswd= await bcrypt.hash(password,10);

        const newUser=await User.create({
            fullName:fullName,
            email:email,
            password:Hashpswd,
        })

        if(newUser){
            generateToken(newUser._id,res);

            return res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });

        }else{
            console.log("Error in signup controller",error.message);
            return res.status(500).json({message:"Internal Server Error"});
        }
    }catch(error){
        console.log("Error in signup controller",error.message);
        return res.status(500).json({message:"Internal Server Error"});

    }
}

export const login=async (req,res)=>{
    const {email,password}=req.body;
    try{
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        const isPswdCorrect=await bcrypt.compare(password,user.password)
        if(!isPswdCorrect){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        generateToken(user._id,res);

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        })

    }catch(error){
        console.log("Error in login controller",error.message);
        return res.status(500).json({message:"Internal Server Error"});
    }
}

export const logout=async (req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0})
        return res.status(200).json({message:"Logged Out Successfully"});
    }catch(error){
        console.log("Error in logout controller",error.message);
        return res.status(500).json({message:"Internal Server Error"});
    }
}

export const updateProfilePic=async (req,res)=>{
    try{
        const {profilePic}=req.body;
        const userId=req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"Profile Pic is required"});
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic)
        const updateUser=await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})

        res.status(200).json({
            profilePic:"Updated Successfully",
        })

    }catch(error){
        console.log("Error in updateProfilePic controller",error.message);
        return res.status(500).json({message:"Internal Server Error"});
    }
}

export const updateProfile=async (req,res)=>{
    try{
        const {profilePic}=req.body;
        const userId=req.user._id;

        if(profilePic){
            const uploadResponse=await cloudinary.uploader.upload(profilePic)
            const updateUser=await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})
        }
        else{
            const updateUser=await User.findByIdAndUpdate(userId,req.body,{new:true})
        }


        res.status(200).message("Profile Update Successfully");

    }catch(error){
        console.log("Error in updateProfile controller",error.message);
        return res.status(500).json({message:"Internal Server Error"});
    }
}

export const checkAuth=async (req,res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth controller",error.message);
        return res.status(500).json({message:"Internal Server Error"});
    }
}