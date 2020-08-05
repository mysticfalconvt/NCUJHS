const mongoose = require("mongoose");
const { userSearchResult } = require("./userController");
const Pbis = mongoose.model("Pbis");
const User = mongoose.model("User");

resetPbisCounts = async () => {
  pbis = await Pbis.update(
    { counted: "" },
    { counted: "true" },
    { multi: true },
  );
  users = await User.update(
    {},
    { taPbisCount: 0, pbisCount: 0 },
    { mulit: true },
  );
};

getStudentWinner = async (teacher, index) => {
  const taStudents = await User.find({ ta: teacher }, { _id: 1 }).distinct(
    "_id",
  );
  const winner = await Pbis.aggregate([
    { $match: { student: { $in: taStudents }, counted: "" } },
    { $sample: { size: 1 } },
  ]);
  let winnerName = {};
  if (winner[0]) {
    const winnerName = await User.findOne(
      { _id: winner[0].student },
      { name: 1 },
    );
    teacher.winnerName = winnerName.name;
    return winnerName.name;
  } else {
    return "No Winner";
  }
};

exports.addPbis = (req, res) => {
  res.render("pbisForm", { title: "Add PBIS" });
};

exports.getPbis = async (req, res) => {
  const category = req.params.category || "category";
  let sort = {};
  sort[category] = 1;
  let pbiss = {};
  if (req.user) {
    // check if teacher for calendar events
    if (req.user.isTeacher || req.user.isAdmin || req.user.isPara) {
      pbiss = await Pbis.find({ counted: "" }).sort(sort);
    }
  }
  res.render("pbisData", { title: "PBIS Data", pbiss: pbiss });
};

exports.createPbis = async (req, res) => {
  req.body.teacher = req.user.id;
  const pbis = await new Pbis(req.body).save();
  // get count for student and save
  const pbisCount = await Pbis.find({
    student: pbis.student._id,
    counted: "",
  }).count();
  const student = await User.findOneAndUpdate(
    { _id: pbis.student },
    { pbisCount: pbisCount },
  );
  // get count for students TA and update TA teachers count
  const taStudents = await User.find({ ta: student.ta._id }, { _id: 1 });
  const taNumbers = await Pbis.find({
    student: { $in: taStudents },
    counted: "",
  }).count();
  const taTeacher = await User.findOneAndUpdate(
    { _id: student.ta._id },
    { taPbisCount: taNumbers },
  );
  req.flash("success", `Successfully Created !!`);
  res.redirect(`/`);
};

exports.getWeeklyPbis = async (req, res) => {
  const teachers = await User.find({ isTeacher: { $ne: "" } });
  for (const teacher of teachers) {
    const winner = await getStudentWinner(teacher._id);
    // console.log(teacher._id);
  }
  res.render("weeklyPbis", {
    title: "PBIS Counts since last collection",
    teachers: teachers,
  });
};
