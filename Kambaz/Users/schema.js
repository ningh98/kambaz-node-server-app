import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
      },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    email: String,
    lastName: String,
    dob: Date,
    role: {
      type: String,
      enum: ["STUDENT", "FACULTY", "ADMIN", "USER"],
      default: "USER",
    },
    loginId: String,
    section: String,
    lastActivity: Date,
    totalActivity: String,
  },
    { collection: "users"}
);

export default userSchema;