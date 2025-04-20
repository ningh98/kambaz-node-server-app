import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// QuizAttempt Schema
export const quizAttemptSchema = new mongoose.Schema(
    {
      _id: { type: String, default: uuidv4 },
      quiz: { type: String, ref: "QuizModel" },
      student: { type: String, ref: "UserModel" },
      startTime: { type: Date, default: Date.now },
      endTime: Date,
      score: Number,
      totalPoints: Number,
      answers: [{
        questionId: String,
        selectedOptionIndex: Number, // for Multiple Choice
        isTrueSelected: Boolean,     // for True/False
        blankAnswer: String,         // for Fill in the Blank
        isCorrect: Boolean
      }],
      attemptNumber: Number, // 1, 2, 3, etc.
      completed: { type: Boolean, default: false }
    },
    { collection: "quizAttempts" }
  );