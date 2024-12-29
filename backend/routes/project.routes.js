import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { body } from "express-validator";
import * as authMiddleware  from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create",authMiddleware.authUser, 
    body("name").isString().withMessage("Name is required"),
    body("description").isString().withMessage("Description is required"),
    projectController.createProject
);

router.get("/all",authMiddleware.authUser,projectController.getAllProjects);

router.put("/add-user",authMiddleware.authUser,
    body('projectId').isString().withMessage("Project ID is required"),
    body('users').isArray({min:1}).withMessage("Users must be an array")
    .custom((users) => users.every(user => typeof user === 'string'))
    .withMessage("Each User must be an strings"),
    projectController.addUserToProject);

router.get('/get-project/:projectId',authMiddleware.authUser,projectController.getProjectById);


export default router;