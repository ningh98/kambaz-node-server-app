import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const schema = new mongoose.Schema(
    {
        _id: { type:String, default: uuidv4 }, 
        name: String,
        description: String,
        course: { type: String, ref: "CourseModel" },

    },
    { collection: "modules" }
);

export default schema;

// type: mongoose.Schema.Types.ObjectId,