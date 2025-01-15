import express from "express";
import morgan from "morgan";
import connectDB from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import geminiRoutes from "./routes/gemini.routes.js";
import cookieParser from "cookie-parser";4

import cors from "cors";

const app = express();

connectDB();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors());

app.use("/users",userRoutes);
app.use("/projects",projectRoutes);
app.use("/ai",geminiRoutes);



export default app;