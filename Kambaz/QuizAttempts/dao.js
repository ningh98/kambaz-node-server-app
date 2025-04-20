import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export function findAttemptsByUser(userId) {
    return model.find({ user: userId }).sort({ startTime: -1 });
}

export function findAttemptsByQuiz(quizId) {
    return model.find({ quiz: quizId }).sort({ startTime: -1 });
}

export function findAttemptsByUserAndQuiz(userId, quizId) {
    return model.find({ user: userId, quiz: quizId }).sort({ startTime: -1 });
}

export function createAttempt(attempt) {
    if (!attempt._id) {
        attempt._id = uuidv4();
    }
    return model.create(attempt);
}

export function updateAttempt(attemptId, attemptUpdates) {
    return model.updateOne({ _id: attemptId }, attemptUpdates);
}

export function deleteAttempt(attemptId) {
    return model.deleteOne({ _id: attemptId });
}

export function findAttemptById(attemptId) {
    return model.findById(attemptId);
}