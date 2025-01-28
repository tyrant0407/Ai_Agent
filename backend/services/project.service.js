import projectModel from "../models/project.model.js";
import mongoose from "mongoose";

export const createProject = async ({name, description, userId}) => {

    if(!name) throw new Error(`Name is required`);
    if(!description) throw new Error(`Description is required`);
    if(!userId) throw new Error(`User ID is required`);


    const project = await projectModel.create({ 
        name, 
        description, 
        users: [userId] });
    return project;
}  

export const getAllProjectByUserId = async ({userId}) => {
    if(!userId) throw new Error(`User ID is required`);
    const allUsersProjects = await projectModel.find({users:userId}).populate('users');
    return allUsersProjects;
}

export const addUsersToProject = async ({projectId, users , userId}) => {
    if(!projectId) throw new Error(`Project ID is required`);
    if(!mongoose.Types.ObjectId.isValid(projectId)) throw new Error(`Invalid Project ID`);
    if(!users) throw new Error(`Users are required`);
    if(!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) throw new Error(`Users must be an array of valid user IDs`);
    if(!userId) throw new Error(`User ID is required`);
    if(!mongoose.Types.ObjectId.isValid(userId)) throw new Error(`Invalid User ID`);
    
    const project = await projectModel.findOne({_id:projectId,users:{$in:[userId]}});
    if(!project) throw new Error(`Project not found`);

    const updatedProject = await projectModel.findOneAndUpdate({
        _id:projectId,
    },{
        $addToSet:{users:{$each:users}}
    },{new:true});
    return updatedProject;
}

export const getProjectById = async ({projectId}) => {
    if(!projectId) throw new Error(`Project ID is required`);
    if(!mongoose.Types.ObjectId.isValid(projectId)) throw new Error(`Invalid Project ID`);
    const project = await projectModel.findOne({_id:projectId}).populate('users');
    return project;
}

export const updateFileTree = async ({projectId, fileTree}) => {
    if(!projectId) throw new Error(`Project ID is required`);
    if(!mongoose.Types.ObjectId.isValid(projectId)) throw new Error(`Invalid Project ID`);
    if(!fileTree) throw new Error(`File tree is required`);
    const project = await projectModel.findOneAndUpdate({_id:projectId},{$set:{fileTree}},{new:true});
    return project;
}
