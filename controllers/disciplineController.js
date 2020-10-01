const mongoose = require("mongoose");
const { getStudents } = require("./userController");
const Discipline = mongoose.model("Discipline");
const User = mongoose.model("User");

exports.addDiscipline = (req, res) => {
  const today = new Date();
  res.render("disciplineFormTeacher", {
    title: "New Discipline Referal",
    discipline: { date: today },
  });
};
