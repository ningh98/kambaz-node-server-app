const assignment = {
    id: 1, title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJs",
    due: "2021-10-10", completed: false, score: 0,
};
const module = {
    id: 1, name: "Week 1 module",
    description: "This is about what we will do in week 1",
    course: "Computer Science",
};

export default function WorkingWithObjects(app) {
    // Assignment
  app.get("/lab5/assignment", (req, res) => {
    res.json(assignment)
  });
  app.get("/lab5/assignment/title", (req, res) => {
    res.json(assignment.title)
  });
  app.get("/lab5/assignment/title/:newTitle", (req, res) => {
    const { newTitle } = req.params;
    assignment.title = newTitle;
    res.json(assignment)
  });
  app.get("/lab5/assignment/score/:newScore", (req, res) => {
    const { newScore } = req.params;
    assignment.score = parseInt(newScore);
    res.json(assignment)
  });
  app.get("/lab5/assignment/completed/:toggleCompleted", (req, res) => {
    const { toggleCompleted } = req.params;
    assignment.completed = toggleCompleted === "true";
    res.json(assignment)
  });

    // Module
  app.get("/lab5/module", (req, res) => {
    res.json(module)
  });
  app.get("/lab5/module/name", (req, res) => {
    res.json(module.name)
  });
  app.get("/lab5/module/name/:newName", (req, res) => {
    const { newName } = req.params;
    module.name = newName;
    res.json(module)
  });
  app.get("/lab5/module/description/:newDescription", (req, res) => {
    const { newDescription } = req.params;
    module.description = newDescription;
    res.json(module)
  });



}
