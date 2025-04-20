import * as quizzesDao from "./dao.js"

export default function AssignmentsRoutes(app) {

app.put("/api/quizzes/:quizId/", async (req, res) => {
        const { quizId } =req.params;
        const quizUpdates = req.body
        const status = await quizzesDao.updateQuiz(quizId, quizUpdates);
        res.send(status);
    })

app.delete("/api/quizzes/:quizId", async (req, res) => {
        const { quizId } = req.params;
        const status = await quizzesDao.deleteQuiz(quizId);
        res.send(status)
    })

// 验证测验访问码
app.post("/api/quizzes/:quizId/access-code", async (req, res) => {
    try {
        const { quizId } = req.params;
        const { accessCode } = req.body;
        
        // 获取测验信息
        const quiz = await quizzesDao.findQuizById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // 验证访问码
        if (quiz.accessCode && quiz.accessCode === accessCode) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: "Invalid access code" });
        }
    } catch (error) {
        console.error("Error verifying access code:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
})
}