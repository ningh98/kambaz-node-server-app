import model from "./model.js";
import { v4 as uuidv4 } from "uuid";


export function findAllCourses() {
    return model.find();
}

// export function findCoursesForEnrolledUser(userId){
//     const { courses, enrollments } = Database;
//     const enrolledCourses = courses.filter((course) => 
//         enrollments.some((enrollments) => enrollments.user === userId && enrollments.course === course._id)
//     )
//     return enrolledCourses;
// }

export function createCourse(course){
    delete course._id;
    return model.create(course);
}

export function deleteCourse(courseId) {
    return model.deleteOne({ _id: courseId });
}

export function updateCourse(courseId, courseUpdates) {
    return model.updatreOne({ _id: courseId }, { $set: courseUpdates });
  }

// export function findPeopleForCourse(courseId){
//     const { enrollments, users } = Database;
//     return users
//         .filter((user) =>
//             enrollments.some((enrollment) => enrollment.course === courseId && enrollment.user === user._id )
//         )             
// }
  
