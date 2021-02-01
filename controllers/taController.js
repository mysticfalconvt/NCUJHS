const mongoose = require("mongoose");
const { isStaff } = require("../handlers/permissions");
const Calendar = mongoose.model("Calendar");
const Callback = mongoose.model("Callback");
const PbisTeam = mongoose.model("PbisTeam");
const User = mongoose.model("User");

exports.taDashboard = async (req, res) => {
  // check if teacher
  if (!isStaff(req.user)) {
    res.redirect("/");
  }

  // find TA students
  const taTeam = await PbisTeam.findOne({
    $or: [
      { teacher1: req.user._id },
      { teacher2: req.user._id },
      { teacher3: req.user._id },
    ],
  });

  const taTeamTeachers = [taTeam.teacher1._id, taTeam.teacher2._id];

  if (taTeam.teacher3) {
    taTeamTeachers.push(taTeam.teacher3._id);
  }

  // console.log(taTeam.teacher1._id);
  const taTeamStudents = await User.find({ ta: { $in: taTeamTeachers } }).sort({
    name: 1,
  });
  const taStudents = await User.find({ ta: req.user._id }).sort({
    name: 1,
  });
  const idArray = taStudents.map(function (id) {
    return id._id;
  });
  // Find Callback Assignments
  const callbacks = await Callback.find({
    student: { $in: idArray },
    completed: "",
  }).sort({ student: 1, date: 1 });
  const teacher = await User.findOne({ _id: req.user._id })
    .populate("previousPbisWinner")
    .populate("currentPbisWinner");
  // console.log(teacher);
  res.render("taDashboard", {
    title: `${req.user.name}'s TA Dashboard `,
    taStudents: taStudents,
    callbacks: callbacks,
    taTeam: taTeam,
    taTeamStudents: taTeamStudents,
    teacher: teacher,
  });
};
