const mongoose = require("mongoose");
const { userSearchResult } = require("./userController");
const Pbis = mongoose.model("Pbis");
const User = mongoose.model("User");
const { catchErrors } = require("../handlers/errorHandlers");

updatePbisCounts = async (student) => {
  const pbisCount = await Pbis.find({
    student: student,
    counted: "",
  }).count();
  const updatedStudent = await User.findOneAndUpdate(
    { _id: student },
    { pbisCount: pbisCount },
  );
  const taStudents = await User.find({ ta: updatedStudent.ta._id }, { _id: 1 });

  const taNumbers = await Pbis.find({
    student: { $in: taStudents },
    counted: "",
  }).count();
  const taTeacher = await User.findOneAndUpdate(
    { _id: updatedStudent.ta._id },
    { taPbisCount: taNumbers },
  );
};

resetPbisCounts = async () => {
  pbis = await Pbis.update(
    { counted: "" },
    { counted: "true" },
    { multi: true },
  );
  users = await User.update(
    {},
    { taPbisCount: 0, pbisCount: 0 },
    { multi: true },
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
    // teacher.winnerName = winnerName.name;
    return winnerName.name;
  } else {
    return "No Winner";
  }
};

exports.addPbis = (req, res) => {
  res.render("pbisForm", { title: "Virtual PBIS Business Card" });
};

exports.getPbis = async (req, res) => {
  const category = req.params.category || "category";
  let sort = {};
  sort[category] = 1;
  let pbiss = {};
  if (req.user) {
    // check if teacher for PBIS
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
  let teachers = await User.find({ isTeacher: { $ne: "" } });
  let teachersWithWinners = [];
  for (let teacher of teachers) {
    const taStudentCount = await User.find({ ta: teacher._id }).count();
    const winner = await getStudentWinner(teacher._id);
    const cardsPerStudent = teacher.taPbisCount / taStudentCount;
    teacherWithWinner = {
      name: teacher.name,
      taPbisCount: teacher.taPbisCount,
      winner: winner,
      taStudentCount: taStudentCount,
      cardsPerStudent: cardsPerStudent,
    };
    teachersWithWinners.push(teacherWithWinner);
  }
  res.render("weeklyPbis", {
    title: "PBIS Counts since last collection",
    teachers: teachersWithWinners,
  });
};

exports.resetPbisCount = async (req, res) => {
  await resetPbisCounts();
  res.redirect("/pbis/weekly");
};

exports.taPbis = async (req, res) => {
  const taStudents = await User.find({ ta: req.params._id }, { name: 1 });
  res.render("taPbisList", { title: "TA PBIS Entry", taStudents });
};

exports.bulkPbisCard = async (req, res) => {
  const card = {
    student: req.params._id,
    teacher: req.user._id,
    category: "Physical Card",
  };
  for (let i = 0; i < req.body.numberOfCards; i++) {
    const pbis = await new Pbis(card).save();
  }
  catchErrors(updatePbisCounts(req.params._id));
  res.redirect("back");
};
