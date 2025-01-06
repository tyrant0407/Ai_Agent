import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import redisClient from "../services/redis.service.js";

export const authUser = async (req,res,next) => {
  try {
     const authHeader = req.headers['authorization'];
    const loginToken = req.cookies.token;
    
    // Log the authHeader for debugging purposes
    // console.log(`Authorization Header: ${authHeader || 'Not provided'}`);
    
    // If both authHeader and loginToken are missing, deny access
    if (!authHeader && !loginToken) {
        console.log("Authorization failed: No token provided");
        return res.status(401).json({ message: "No token provided" });
    }
  
    // Extract token: use authHeader if available, otherwise fall back to loginToken from cookies
    const token = authHeader ? authHeader.split(" ")[1] : loginToken;
    
    const isBlacklisted = await redisClient.get(token);
    if(isBlacklisted){
        res.cookie("token",'');
        return res.status(401).json({message:"Token is blacklisted"});
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({error:"Unauthorized"});
  }
}

