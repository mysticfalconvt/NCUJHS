const mongoose = require("mongoose");
const Progress = mongoose.model("Progress");
const User = mongoose.model("User");

exports.addProgress = (req, res) => {
  const today = new Date();
  res.render("disciplineFormTeacher", {
    title: "New Discipline Referal",
  });
};
