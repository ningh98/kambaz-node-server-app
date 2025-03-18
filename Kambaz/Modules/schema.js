import mongoose from "mongoose";
const schema = new mongoose.Schema(
    {
        name: String,
        description: String,
        course: { type: String, ref: "CourseModel" },

    },
    { collection: "modules" }
);

export default schema;

// type: mongoose.Schema.Types.ObjectId,