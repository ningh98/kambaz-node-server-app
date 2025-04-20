import * as quizAttemptsDao from "./dao.js";
import * as quizzesDao from "../Quizzes/dao.js";

export default function QuizAttemptsRoutes(app) {
    // Get all quiz attempts for a user
    app.get("/api/users/:userId/attempts", async (req, res) => {
        try {
            const { userId } = req.params;
            const attempts = await quizAttemptsDao.findAttemptsByUser(userId);
            res.json(attempts);
        } catch (error) {
            console.error("Failed to get user quiz attempts:", error);
            res.status(500).json({ message: "Failed to get user quiz attempts", error: error.message });
        }
    });

    // Get all attempts for a specific quiz
    app.get("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const { quizId } = req.params;
            const attempts = await quizAttemptsDao.findAttemptsByQuiz(quizId);
            res.json(attempts);
        } catch (error) {
            console.error("Failed to get quiz attempts:", error);
            res.status(500).json({ message: "Failed to get quiz attempts", error: error.message });
        }
    });

    // Get all attempts by a user for a specific quiz
    app.get("/api/users/:userId/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const { userId, quizId } = req.params;
            const attempts = await quizAttemptsDao.findAttemptsByUserAndQuiz(userId, quizId);
            res.json(attempts);
        } catch (error) {
            console.error("Failed to get user quiz attempts:", error);
            res.status(500).json({ message: "Failed to get user quiz attempts", error: error.message });
        }
    });

    // Create a new quiz attempt
    app.post("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const { quizId } = req.params;
            const currentUser = req.session["currentUser"];
            
            if (!currentUser) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            
            const quiz = await quizzesDao.findQuizById(quizId);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            
            const attempt = {
                quiz: quizId,
                user: currentUser._id,
                startTime: new Date(),
                maxScore: quiz.points || 0,
                completed: false,
                answers: []
            };
            
            const createdAttempt = await quizAttemptsDao.createAttempt(attempt);
            res.status(201).json(createdAttempt);
        } catch (error) {
            console.error("Failed to create quiz attempt:", error);
            res.status(500).json({ message: "Failed to create quiz attempt", error: error.message });
        }
    });

    // Update a quiz attempt (submit answers or complete quiz)
    app.put("/api/attempts/:attemptId", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const attemptUpdates = req.body;
            const currentUser = req.session["currentUser"];
            
            if (!currentUser) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            
            const attempt = await quizAttemptsDao.findAttemptById(attemptId);
            if (!attempt) {
                return res.status(404).json({ message: "Quiz attempt not found" });
            }
            
            if (attempt.user !== currentUser._id) {
                return res.status(403).json({ message: "Not authorized to modify this quiz attempt" });
            }
            
            const status = await quizAttemptsDao.updateAttempt(attemptId, attemptUpdates);
            res.json(status);
        } catch (error) {
            console.error("Failed to update quiz attempt:", error);
            res.status(500).json({ message: "Failed to update quiz attempt", error: error.message });
        }
    });

    // Delete a quiz attempt
    app.delete("/api/attempts/:attemptId", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const currentUser = req.session["currentUser"];
            
            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403).json({ message: "Not authorized to delete quiz attempts" });
            }
            
            const status = await quizAttemptsDao.deleteAttempt(attemptId);
            res.json(status);
        } catch (error) {
            console.error("Failed to delete quiz attempt:", error);
            res.status(500).json({ message: "Failed to delete quiz attempt", error: error.message });
        }
    });

    // Submit quiz answers
    app.post("/api/quizzes/:quizId/submit", async (req, res) => {
        try {
          const { quizId } = req.params;
          const { answers, endTime } = req.body;
          const studentId = req.session.currentUser._id; // Adjust based on your session structure
          
          // Check if quiz exists
          const quiz = await quizzesDao.findQuizById(quizId);
          if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
          }
          
          // Check if student has reached the attempt limit
          const attempts = await quizAttemptsDao.findAttemptsByUserAndQuiz(studentId, quizId);
          const attemptCount = attempts.filter(a => a.completed).length;
          
          if (!quiz.multipleAttempts && attemptCount > 0) {
            return res.status(403).json({ message: "Multiple attempts not allowed" });
          }
          
          if (quiz.multipleAttempts && attemptCount >= quiz.attemptsAllowed) {
            return res.status(403).json({ message: "Maximum attempts reached" });
          }
          
          // Calculate score
          let score = 0;
          const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
          
          const answersWithCorrectness = answers.map((answer, index) => {
            const question = quiz.questions[index];
            let isCorrect = false;
            
            // Check if answer is correct based on question type
            if (question.questionType === 'Multiple Choice' && question.options) {
              isCorrect = answer.selectedOptionIndex !== undefined && 
                         question.options[answer.selectedOptionIndex].isCorrect;
            } else if (question.questionType === 'True/False') {
              isCorrect = answer.isTrueSelected !== undefined && 
                         answer.isTrueSelected === question.isTrueCorrect;
            } else if (question.questionType === 'Fill in the Blank' && question.blankAnswers) {
              // Check fill in the blank answer
              const userAnswer = answer.blankAnswer || '';
              const normalizedUserAnswer = question.isCaseSensitive 
                ? userAnswer.trim() 
                : userAnswer.trim().toLowerCase();
              
              isCorrect = question.blankAnswers.some(correctAnswer => {
                const normalizedCorrectAnswer = question.isCaseSensitive 
                  ? correctAnswer.text.trim() 
                  : correctAnswer.text.trim().toLowerCase();
                return normalizedUserAnswer === normalizedCorrectAnswer;
              });
            }
            
            if (isCorrect) {
              score += question.points;
            }
            
            return { 
              questionId: question._id,
              selectedOptionIndex: answer.selectedOptionIndex,
              isTrueSelected: answer.isTrueSelected,
              blankAnswer: answer.blankAnswer,
              isCorrect 
            };
          });
          
          // Create new quiz attempt record
          const newAttempt = {
            quiz: quizId,
            student: studentId,
            startTime: new Date(), // Or get from request
            endTime: endTime ? new Date(endTime) : new Date(),
            score,
            totalPoints,
            answers: answersWithCorrectness,
            attemptNumber: attemptCount + 1,
            completed: true
          };
          
          const attempt = await quizAttemptsDao.createAttempt(newAttempt);
          
          res.status(201).json(attempt);
        } catch (error) {
          console.error("Failed to submit quiz answers:", error);
          res.status(500).json({ message: "Failed to submit quiz answers", error: error.message });
        }
      });

    // Get all attempts by a specific student for a specific quiz (matches frontend path)
    app.get("/api/quizzes/:quizId/submissions/student/:studentId", async (req, res) => {
        try {
          const { quizId, studentId } = req.params;
          const attempts = await quizAttemptsDao.findAttemptsByUserAndQuiz(studentId, quizId);
          
          // Sort by time (newest first)
          attempts.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
          
          res.json(attempts);
        } catch (error) {
          console.error("Failed to get student quiz attempts:", error);
          res.status(500).json({ message: "Failed to get student quiz attempts", error: error.message });
        }
      });

    // Submit quiz answers (matches frontend path)
    app.post("/api/quizzes/:quizId/submissions", async (req, res) => {
        try {
          const { quizId } = req.params;
          const submissionData = req.body;
          const studentId = submissionData.studentId || req.session?.currentUser?._id;
          
          if (!studentId) {
            return res.status(401).json({ message: "Unauthorized, missing student ID" });
          }
          
          // Check if quiz exists
          const quiz = await quizzesDao.findQuizById(quizId);
          if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
          }
          
          // Check if student has reached the attempt limit
          const attempts = await quizAttemptsDao.findAttemptsByUserAndQuiz(studentId, quizId);
          const attemptCount = attempts.filter(a => a.completed).length;
          
          if (!quiz.multipleAttempts && attemptCount > 0) {
            return res.status(403).json({ message: "Multiple attempts not allowed" });
          }
          
          if (quiz.multipleAttempts && quiz.attemptsAllowed && attemptCount >= quiz.attemptsAllowed) {
            return res.status(403).json({ message: "Maximum attempts reached" });
          }
          
          // Create new quiz attempt record
          const newAttempt = {
            quiz: quizId,
            student: studentId,
            startTime: submissionData.startTime ? new Date(submissionData.startTime) : new Date(),
            endTime: submissionData.endTime ? new Date(submissionData.endTime) : new Date(),
            score: submissionData.score.earned,
            totalPoints: submissionData.score.total,
            answers: Object.entries(submissionData.answers).map(([questionId, answerData]) => {
              return {
                questionId,
                selectedOptionIndex: answerData.selectedOption,
                blankAnswer: answerData.textAnswer,
                isCorrect: answerData.isCorrect
              };
            }),
            attemptNumber: submissionData.attemptNumber || (attemptCount + 1),
            completed: true
          };
          
          const attempt = await quizAttemptsDao.createAttempt(newAttempt);
          
          res.status(201).json(attempt);
        } catch (error) {
          console.error("Failed to submit quiz answers:", error);
          res.status(500).json({ message: "Failed to submit quiz answers", error: error.message });
        }
      });
}