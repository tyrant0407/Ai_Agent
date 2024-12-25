import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";

export const createUserController = async (req, res) => {

const errors = validationResult(req);
if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});

const {email,password} = req.body;

try{
    const user = await userService.createUser({email,password});
    const token = await user.generateJWT();
   
    res.status(201).json({user,token});
    if(res.statusCode === 201){
        console.log("User created successfully");
    }
}catch(error){
    res.status(500).json({error:error.message});
}
};

export const loginUserController = async (req,res) => {
    const errors = validationResult(req);
     if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});

 try{
    const {email,password} = req.body;
    const user = await userModel.findOne({email}).select("+password");
    
    if(!user) return res.status(404).json({error:"User not found"});
    
    const isValidPassword = await user.isValidPassword(password);
    if(!isValidPassword) return res.status(401).json({error:"Invalid password or credentials"});
    
    const token = await user.generateJWT();
    
    res.status(200).json({user,token});
    if(res.statusCode === 200){
        console.log(`User Logged in successfully ${user.email}`);
    }
 }catch(error){
    res.status(500).json({error:error.message});
 }
};  

export const profileController = async (req,res) => {
    console.log(req.user);
    res.status(200).json({user:req.user});
};

export const logoutUserController = async (req,res) => {
    try {
        const token = req.headers.authorization.split(" ")[1] || req.cookies.token;
        await redisClient.set(token,"logout","EX",60*60*24);
        res.status(200).json({message:"Logged out successfully"});
        if(res.statusCode === 200){
            console.log("User logged out successfully");
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({error:error.message});
    }
};
