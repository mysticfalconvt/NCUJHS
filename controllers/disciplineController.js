const mongoose = require("mongoose");
const { getStudents } = require("./userController");
const Discipline = mongoose.model("Discipline");
const User = mongoose.model("User");

exports.addDiscipline () => {
    res.render("disiplineFormTeacher", {title: "New Discipline Referal"})
};
