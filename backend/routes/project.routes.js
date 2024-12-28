import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { body } from "express-validator";
import * as authMiddleware  from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/create", authMiddleware.authUser, 
    body("name").isString().withMessage("Name is required"),
    body("description").isString().withMessage("Description is required"),
    projectController.createProject
);

export default router;