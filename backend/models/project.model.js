import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
        unique: [true, "Project name must be unique"],
        trim: true,
        lowercase: true,
        },
    description: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user"}],
    fileTree: { type: Object, default: {} },
});

const Project = mongoose.model("project", projectSchema);

export default Project;