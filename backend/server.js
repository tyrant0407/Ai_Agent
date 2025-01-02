import "dotenv/config";
import http from "http";
import app from "./app.js";
import {Server} from "socket.io";

const server = http.createServer(app);
const io = new Server(server);
const Port = process.env.PORT || 3000;


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

