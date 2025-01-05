import "dotenv/config";
import http from "http";
import app from "./app.js";
import {Server} from "socket.io";
import jwt from "jsonwebtoken";

const server = http.createServer(app);
const io = new Server(server);
const Port = process.env.PORT || 3000;

io.use((socket,next)=>{
    try {
        const token = socket.handshake.auth?.token  || socket.handshake.headers.authorization?.split(" ")[1];

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
    console.log(`User connected: ${socket.id}`);
  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => { /* … */ });
});

server.listen(Port, async ()=>{
    try {
        console.log(`Server is running on port ${Port}`);
    } catch (error) {
        console.log(error);
    }
})

