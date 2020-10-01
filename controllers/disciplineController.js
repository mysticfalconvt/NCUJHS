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

exports.createDiscipline = async (req, res) => {
  req.body.teacher = req.user._id;
  const discipline = await new Discipline(req.body).save();
  res.redirect(`/discipline/${discipline._id}`);
};

exports.viewDiscipline = async (req, res) => {
  const discipline = await Discipline.findOne({ _id: req.params._id });
  res.render("viewDiscipline", {
    title: `View Incident for ${discipline.student.name}`,
  });
};
