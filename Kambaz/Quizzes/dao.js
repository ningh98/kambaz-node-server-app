import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export function findQuizForCourse(courseId) {
    return model.find({ course: courseId })
}


export function createQuiz(quiz) {
    delete quiz._id;
    return model.create(quiz);
}

export function updateQuiz(quizId, quizUpdates) {
    return model.updateOne({ _id: quizId }, quizUpdates);
}

export function deleteQuiz(quizId) {
    return model.deleteOne({ _id: quizId });
}