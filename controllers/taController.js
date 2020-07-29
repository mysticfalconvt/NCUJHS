const mongoose = require("mongoose");
const Calendar = mongoose.model("Calendar");
const Callback = mongoose.model("Callback");
const User = mongoose.model("User");

exports.taDashboard = async (req, res) => {
  // check if teacher
  if (!req.user.isTeacher) {
    res.redirect("/");
  }

  // find TA students
  taStudents = await User.find({ ta: req.user._id });
  idArray = taStudents.map(function (id) {
    return id._id;
  });
  // Find Callback Assignments
  const callbacks = await Callback.find({
    student: { $in: idArray },
    completed: "",
  }).sort({ student: 1, date: 1 });

  res.render("taDashboard", {
    title: `${req.user.name}'s TA Dashboard `,
    taStudents: taStudents,
    callbacks: callbacks,
  });
};
