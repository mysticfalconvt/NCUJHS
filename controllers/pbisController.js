const mongoose = require("mongoose");
const { userSearchResult } = require("./userController");
const Pbis = mongoose.model("Pbis");
const User = mongoose.model("User");
const PbisTeam = mongoose.model("PbisTeam");
const { catchErrors } = require("../handlers/errorHandlers");
const { findOneAndUpdate } = require("../models/User");
const averageCardsPerLevel = 15;

updatePbisCounts = async (student) => {
  const pbisCount = await Pbis.find({
    student: student,
    counted: "",
  }).countDocuments();
  const yearPbisCount = await Pbis.find({
    student: student,
  }).estimatedDocumentCount();

  const updatedStudent = await User.findOneAndUpdate(
    { _id: student },
    { pbisCount: pbisCount, yearPbisCount: yearPbisCount },
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

updateTeamPbis = async (team) => {
  const teacherIds = [team.teacher1._id, team.teacher2._id];
  if (team.teacher3) {
    teacherIds.push(team.teacher3._id);
  }

  const teachers = await User.find({ _id: { $in: teacherIds } });
  const taTeamStudents = await User.find(
    { ta: { $in: teacherIds } },
    { _id: 1 },
  );
  const numberOfStudents = await User.find({ ta: { $in: teacherIds } }).count();
  // numberOfStudents = taTeamStudents.length();
  const taTeamUncounted = await Pbis.find({
    student: { $in: taTeamStudents },
    counted: "",
  }).count();
  const taTeamTotalCards = await Pbis.find({
    student: { $in: taTeamStudents },
  }).count();
  const currentAverageCardsPerStudent = taTeamUncounted / numberOfStudents;
  const newAverageCardsPerStudent =
    team.averageCardsPerStudent + currentAverageCardsPerStudent;
  const currentLevel = Math.floor(
    newAverageCardsPerStudent / averageCardsPerLevel,
  );
  const teamUpdates = {
    numberOfStudents,
    currentUncountedCards: taTeamUncounted,
    averageCardsPerStudent: newAverageCardsPerStudent || 0,
    currentLevel: currentLevel || 0,
    totalCards: taTeamTotalCards || 0,
  };

  const updatedPbisTeam = await PbisTeam.findOneAndUpdate(
    { _id: team._id },
    teamUpdates,
  );
};

checkInTeamCards = async () => {
  const listOfTaTeams = await PbisTeam.find({ schoolWide: false });
  for (let team of listOfTaTeams) {
    await updateTeamPbis(team);
  }
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

getGoal = (lowestLevel) => {
  if (lowestLevel < 2) {
    return 2;
  } else if (lowestLevel < 4) {
    return 4;
  } else if (lowestLevel < 7) {
    return 7;
  } else if (lowestLevel < 10) {
    return 10;
  }
};

updateSchoolWidePbis = async () => {
  const numberofTeams = await PbisTeam.find({
    schoolWide: false,
  }).countDocuments();
  const pbisTeams = await PbisTeam.find({ schoolWide: false });
  let lowestLevel = 20;
  pbisTeams.forEach(function (data, index) {
    if (data.currentLevel < lowestLevel) {
      lowestLevel = data.currentLevel;
    }
  });
  let teamsAtGoal = 0;
  const nextGoal = getGoal(lowestLevel);
  pbisTeams.forEach(function (data, index) {
    if (data.currentLevel >= nextGoal) {
      teamsAtGoal++;
    }
  });

  const update = {
    totalTeams: numberofTeams,
    lowestLevel: lowestLevel,
    nextGoal: nextGoal,
    teamsAtGoal: teamsAtGoal,
  };
  const schoolwideUpdate = await PbisTeam.findOneAndUpdate(
    { schoolWide: true },
    update,
  );
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
  }).countDocuments();

  const yearPbisCount = await Pbis.find({
    student: pbis.student._id,
  }).estimatedDocumentCount();

  const student = await User.findOneAndUpdate(
    { _id: pbis.student },
    { pbisCount: pbisCount, yearPbisCount: yearPbisCount },
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

// exports.resetPbisCount = async (req, res) => {
//   await resetPbisCounts();
//   res.redirect("/pbis/weekly");
// };

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
  const student = await User.findOne({ _id: req.params._id }, { name: 1 });
  catchErrors(updatePbisCounts(req.params._id));
  req.flash(
    "success",
    `Successfully counted ${req.body.numberOfCards} Cards for ${student.name}`,
  );
  res.redirect("back");
};

exports.addPbisTeam = (req, res) => {
  const pbisTeam = {};
  res.render("editPbisTeam", { title: "Add a new PBIS Team", pbisTeam });
};

exports.taTeamList = async (req, res) => {
  const listOfTeams = await PbisTeam.find({ schoolWide: false });
  res.render("pbisTeamList", { title: "PBIS Teams", listOfTeams });
};

exports.createPbisTeam = async (req, res) => {
  const pbisTeam = await new PbisTeam(req.body).save();
  res.redirect("/pbis/teamList");
};
exports.editPbisTeam = async (req, res) => {
  const pbisTeam = await PbisTeam.findOne({ _id: req.params._id });
  res.render("editPbisTeam", {
    title: `Edit Team ${pbisTeam.name}`,
    pbisTeam,
  });
};
exports.updatePbisTeam = async (req, res) => {
  const pbisTeam = await PbisTeam.findOneAndUpdate(
    { _id: req.params._id },
    req.body,
  );
  res.redirect("/pbis/teamList");
};

exports.weeklyPbisCheckIn = async (req, res) => {
  await checkInTeamCards();
  await resetPbisCounts();
  await updateSchoolWidePbis();
  res.redirect("/pbis/teamList");
};
