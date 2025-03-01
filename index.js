import express from 'express';
import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import cors from 'cors';
import "dotenv/config";
import session from 'express-session';
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from './Kambaz/Courses/routes.js';
import ModuleRoutes from './Kambaz/Modules/routes.js';
import AssignmentsRoutes from './Kambaz/Assignments/routes.js';
import EnrollmentRoutes from './Kambaz/Enrollments/routes.js';
const app = express();
app.use(cors({
    credentials: true,
    origin: process.env.NETLIFY_URL || "https://a5--sparkling-profiterole-eeee03.netlify.app" ||"http://localhost:5173",
}));

const sessionOptions = {
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
  };
if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
};
}

  
app.use(
session(sessionOptions)
);
  
app.use(express.json());
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentsRoutes(app);
EnrollmentRoutes(app);
Hello(app)
Lab5(app)
app.listen(process.env.PORT || 4000)