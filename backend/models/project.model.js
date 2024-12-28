import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        },
    description: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user"}],
});

const Project = mongoose.model("project", projectSchema);

export default Project;