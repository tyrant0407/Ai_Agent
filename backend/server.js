import "dotenv/config";
import http from "http";
import app from "./app.js";
import {Server} from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import { generateResult } from "./services/gemini.service.js";

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: "*",
    }
});
const Port = process.env.PORT || 3000;

io.use(async(socket,next)=>{
    try {
        const token = socket.handshake.auth?.token  || socket.handshake.headers.authorization?.split(" ")[1];
        const projectId = socket.handshake.query.projectId;

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            throw new Error("Invalid Project id");
        }

        socket.project = await projectModel.findById(projectId).lean();

        if(!token){
            throw new Error("Authentication failed");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(!decoded){
            throw new Error("Authentication failed");
        }
        socket.user = decoded;
        next();
    } catch (error) {
    next(error);
    }
    
})


io.on('connection', socket => {
    socket.roomId = socket.project._id.toString();
    console.log(`User connected: ${socket.id}`);
    socket.join(socket.roomId);
    socket.on("project-message", async data =>{
        const message = data.message;
        const aiIsPresentInMessage = message.includes('@ai' || '@AI' || '@Ai' || '@aI');
        socket.broadcast.to(socket.roomId).emit("project-message", data);
        if(aiIsPresentInMessage){
         const prompt = message.replace('@ai','').replace('@AI','').replace('@Ai','').replace('@aI','');
         const result = await generateResult(prompt);
         io.to(socket.roomId).emit("project-message",{
            message:result,
            sender:{
                _id: "ai",
                email: "AI"
            }
         })
        }
        // console.log("message",data)
        
    })

  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => { 
    console.log(`User disconnected: ${socket.id}`);
    socket.leave(socket.roomId);
   });
});

server.listen(Port, async ()=>{
    try {
        console.log(`Server is running on port ${Port}`);
    } catch (error) {
        console.log(error);
    }
})

