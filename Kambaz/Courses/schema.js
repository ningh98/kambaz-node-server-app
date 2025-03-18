import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const courseSchema = new mongoose.Schema(
    {
    _id: { type:String, default: uuidv4 },
    name: String,
    number: String,
    credits: Number,
    description: String,
    },
    { collection: "courses"}

);

export default courseSchema;