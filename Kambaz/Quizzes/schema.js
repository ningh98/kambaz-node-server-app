import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const schema = new mongoose.Schema(
    {
        _id: { type: String, default: uuidv4 },
        title: String,
        instructions: String,
        course: { type: String, ref: "CourseModel" },
        module: { type: String, ref: "ModuleModel" },
        published: { type: Boolean, default: false },
        quizType: { 
            type: String, 
            enum: ['Graded Quiz', 'Practice Quiz', 'Graded Survey', 'Ungraded Survey'],
            default: 'Graded Quiz'
        },
        points: { type: Number, default: 0 },
        assignmentGroup: { 
            type: String, 
            enum: ['Quizzes', 'Exams', 'Assignments', 'Project'],
            default: 'Quizzes'
        },
        shuffleAnswers: { type: Boolean, default: true },
        timeLimit: { type: Number, default: 20 }, // in minutes
        multipleAttempts: { type: Boolean, default: false },
        attemptsAllowed: { type: Number, default: 1 },
        showCorrectAnswers: { type: Boolean, default: 'After submission' },
        accessCode: { type: String, default: '' },
        oneQuestionAtATime: { type: Boolean, default: true },
        webcamRequired: { type: Boolean, default: false },
        lockQuestionsAfterAnswering: { type: Boolean, default: false },
        dueDate: Date,
        availableDate: Date,
        untilDate: Date,
        questions: [{
            title: String, // Question title
            questionText: String, // The actual question content (WYSIWYG)
            questionType: { 
                type: String, 
                enum: ['Multiple Choice', 'True/False', 'Short Answer', 'Essay', 'Fill in the Blank', 'Matching'],
                default: 'Multiple Choice'
            },
            points: { type: Number, default: 1 },
            // For Multiple Choice questions
            options: [{
                text: String, // Option text
                isCorrect: Boolean, // Whether this option is correct
                feedback: String // Optional feedback for this option
            }],
            // For True/False questions
            isTrueCorrect: { type: Boolean, default: false }, // Whether "True" is the correct answer
            // For Fill in the Blank questions
            blankAnswers: [{
                text: String, // Possible correct answer
                feedback: String // Optional feedback for this answer
            }],
            isCaseSensitive: { type: Boolean, default: false }, // Whether answers are case sensitive
            // For other question types
            correctAnswer: String, // For other question types
            feedback: String, // General feedback for the question
            isRequired: { type: Boolean, default: true } // Whether the question is required
        }],
        createdBy: { type: String, ref: "UserModel" },
        createdAt: { type: Date, default: Date.now },
        isDraft: { type: Boolean, default: true } // Whether the quiz is a draft
    },
    { collection: "quizzes" }
);

export default schema;