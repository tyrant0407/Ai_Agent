import "dotenv/config";
import http from "http";
import app from "./app.js";

const server = http.createServer(app);
const Port = process.env.PORT || 3000;

server.listen(Port, async ()=>{
    try {
        console.log(`Server is running on port ${Port}`);
    } catch (error) {
        console.log(error);
    }
})
