import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
const schema = new mongoose.Schema(
    {
        _id: { type:String, default: uuidv4 }, 
        title: String,
        course: { type: String, ref: "CourseModel" },
        description: String,
        points: Number,
        dueDate: Date,
        availableDate: Date,
        until: Date,
    },
    { collection: "assignments" }
);

export default schema;
