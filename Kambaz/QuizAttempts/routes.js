import * as quizAttemptsDao from "./dao.js";
import * as quizzesDao from "../Quizzes/dao.js";

export default function QuizAttemptsRoutes(app) {
    // 获取用户的所有测验尝试
    app.get("/api/users/:userId/attempts", async (req, res) => {
        try {
            const { userId } = req.params;
            const attempts = await quizAttemptsDao.findAttemptsByUser(userId);
            res.json(attempts);
        } catch (error) {
            console.error("获取用户测验尝试失败:", error);
            res.status(500).json({ message: "获取用户测验尝试失败", error: error.message });
        }
    });

    // 获取特定测验的所有尝试
    app.get("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const { quizId } = req.params;
            const attempts = await quizAttemptsDao.findAttemptsByQuiz(quizId);
            res.json(attempts);
        } catch (error) {
            console.error("获取测验尝试失败:", error);
            res.status(500).json({ message: "获取测验尝试失败", error: error.message });
        }
    });

    // 获取用户对特定测验的所有尝试
    app.get("/api/users/:userId/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const { userId, quizId } = req.params;
            const attempts = await quizAttemptsDao.findAttemptsByUserAndQuiz(userId, quizId);
            res.json(attempts);
        } catch (error) {
            console.error("获取用户测验尝试失败:", error);
            res.status(500).json({ message: "获取用户测验尝试失败", error: error.message });
        }
    });

    // 创建新的测验尝试
    app.post("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const { quizId } = req.params;
            const currentUser = req.session["currentUser"];
            
            if (!currentUser) {
                return res.status(401).json({ message: "未授权" });
            }
            
            const quiz = await quizzesDao.findQuizById(quizId);
            if (!quiz) {
                return res.status(404).json({ message: "找不到指定的测验" });
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
            console.error("创建测验尝试失败:", error);
            res.status(500).json({ message: "创建测验尝试失败", error: error.message });
        }
    });

    // 更新测验尝试（提交答案或完成测验）
    app.put("/api/attempts/:attemptId", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const attemptUpdates = req.body;
            const currentUser = req.session["currentUser"];
            
            if (!currentUser) {
                return res.status(401).json({ message: "未授权" });
            }
            
            const attempt = await quizAttemptsDao.findAttemptById(attemptId);
            if (!attempt) {
                return res.status(404).json({ message: "找不到指定的测验尝试" });
            }
            
            if (attempt.user !== currentUser._id) {
                return res.status(403).json({ message: "无权修改此测验尝试" });
            }
            
            const status = await quizAttemptsDao.updateAttempt(attemptId, attemptUpdates);
            res.json(status);
        } catch (error) {
            console.error("更新测验尝试失败:", error);
            res.status(500).json({ message: "更新测验尝试失败", error: error.message });
        }
    });

    // 删除测验尝试
    app.delete("/api/attempts/:attemptId", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const currentUser = req.session["currentUser"];
            
            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403).json({ message: "无权删除测验尝试" });
            }
            
            const status = await quizAttemptsDao.deleteAttempt(attemptId);
            res.json(status);
        } catch (error) {
            console.error("删除测验尝试失败:", error);
            res.status(500).json({ message: "删除测验尝试失败", error: error.message });
        }
    });

    // 提交测验答案
app.post("/api/quizzes/:quizId/submit", async (req, res) => {
    try {
      const { quizId } = req.params;
      const { answers, endTime } = req.body;
      const studentId = req.session.currentUser._id; // 根据您的会话结构调整
      
      // 检查测验是否存在
      const quiz = await quizzesDao.findQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // 检查学生是否已达到尝试次数上限
      const attempts = await quizAttemptsDao.findAttemptsByUserAndQuiz(studentId, quizId);
      const attemptCount = attempts.filter(a => a.completed).length;
      
      if (!quiz.multipleAttempts && attemptCount > 0) {
        return res.status(403).json({ message: "Multiple attempts not allowed" });
      }
      
      if (quiz.multipleAttempts && attemptCount >= quiz.attemptsAllowed) {
        return res.status(403).json({ message: "Maximum attempts reached" });
      }
      
      // 计算得分
      let score = 0;
      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      
      const answersWithCorrectness = answers.map((answer, index) => {
        const question = quiz.questions[index];
        let isCorrect = false;
        
        // 根据问题类型检查答案是否正确
        if (question.questionType === 'Multiple Choice' && question.options) {
          isCorrect = answer.selectedOptionIndex !== undefined && 
                     question.options[answer.selectedOptionIndex].isCorrect;
        } else if (question.questionType === 'True/False') {
          isCorrect = answer.isTrueSelected !== undefined && 
                     answer.isTrueSelected === question.isTrueCorrect;
        } else if (question.questionType === 'Fill in the Blank' && question.blankAnswers) {
          // 检查填空题答案
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
      
      // 创建新的测验尝试记录
      const newAttempt = {
        quiz: quizId,
        student: studentId,
        startTime: new Date(), // 或者从请求中获取
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
      console.error("提交测验答案失败:", error);
      res.status(500).json({ message: "提交测验答案失败", error: error.message });
    }
  });
}