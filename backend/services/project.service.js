import projectModel from "../models/project.model.js";

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