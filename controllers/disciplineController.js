const mongoose = require("mongoose");
const { reportDisciplineToAdmin } = require("./mailController");
const { reportBullyingToAdmin } = require("./mailController");
const Discipline = mongoose.model("Discipline");
const Bullying = mongoose.model("Bullying");
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
  reportDisciplineToAdmin(discipline._id);
  res.redirect(`/discipline/${discipline._id}`);
};
exports.updateDiscipline = async (req, res) => {
  const discipline = await Discipline.findOneAndUpdate(
    { _id: req.params._id },
    req.body,
  );
  res.redirect(`/discipline/${discipline._id}`);
};

exports.viewDiscipline = async (req, res) => {
  const discipline = await Discipline.findOne({ _id: req.params._id });
  res.render("viewDiscipline", {
    title: `View Incident for ${discipline.student.name}`,
    discipline,
  });
};
exports.viewDisciplinePrintable = async (req, res) => {
  const discipline = await Discipline.findOne({ _id: req.params._id });
  res.render("viewDisciplinePrintable", {
    title: `View Incident for ${discipline.student.name}`,
    discipline,
  });
};

exports.viewDisciplineList = async (req, res) => {
  if (
    (req.user.name.search("Colleen Storrings") >= 0) |
    (req.user.name.search("Mr. Boskind") >= 0) |
    (req.user.name.search("Meghan Corbett") >= 0) |
    (req.user.name.search("Nicole Corbett") >= 0)
  ) {
    const disciplines = await Discipline.find().sort({ date: -1 });
    res.render("disciplineList", {
      title: "Discipline Referal List",
      disciplines,
    });
  } else {
    const disciplines = await Discipline.find({ teacher: req.user._id }).sort({
      date: -1,
    });
    res.render("disciplineList", {
      title: "Discipline Referal List",
      disciplines,
    });
  }
};

// Hazing Harrassment Bullying

exports.addBullying = (req, res) => {
  const today = new Date();
  res.render("bullyingForm", {
    title: `New HHB Referal Form: ${req.user.bullyingRole || "staff"}`,
    bullying: { date: today, authorName: req.user.name },
    role: req.user.bullyingRole || "none",
  });
};

exports.createBullying = async (req, res) => {
  req.body.author = req.user._id;
  req.body.dateReported = new Date();
  req.body.formType = req.user.bullyingRole || "staff";
  const bullying = await new Bullying(req.body).save();
  reportBullyingToAdmin(bullying._id);
  res.redirect(`/bullying/list`);
};

exports.viewBullyingList = async (req, res) => {
  if (
    (req.user.name.search("Colleen Storrings") >= 0) |
    (req.user.name.search("Mr. Boskind") >= 0) |
    (req.user.name.search("Nicole Corbett") >= 0)
  ) {
    const bullyings = await Bullying.find().sort({ date: -1 });
    res.render("bullyingList", {
      title: "HHB Referal List",
      bullyings,
    });
  } else {
    const bullyings = await Bullying.find({ author: req.user._id }).sort({
      date: -1,
    });
    res.render("bullyingList", {
      title: "HHB Referal List",
      bullyings,
    });
  }
};

exports.updateBullying = async (req, res) => {
  const bullying = await Bullying.findOneAndUpdate(
    { _id: req.params._id },
    req.body,
  );
  res.redirect(`/bullying/list`);
};

exports.viewBullying = async (req, res) => {
  const bullying = await Bullying.findOne({ _id: req.params._id });
  res.render("viewBullying", {
    title: `View Incident for ${bullying.offender.name}`,
    bullying,
    role: bullying.formType,
  });
};
exports.viewPrintBullying = async (req, res) => {
  const bullying = await Bullying.findOne({ _id: req.params._id });
  res.render("viewBullyingPrintable", {
    title: `View Incident for ${bullying.offender.name}`,
    bullying,
    role: bullying.formType,
  });
};
