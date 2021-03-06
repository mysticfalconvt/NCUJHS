const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");
const mail = require("../handlers/mail");
const Discipline = mongoose.model("Discipline");
const StudentFocus = mongoose.model("studentFocus");
const Bullying = mongoose.model("Bullying");
const Pbis = mongoose.model("Pbis");

exports.sendParentSignup = async (req, res) => {
  // 1. see if the email exists
  const user = await User.findOne({ _id: req.params._id });
  if (!user) {
    req.flash("error", "No account with that email exists");
    return res.redirect("/");
  }
  // 3. Send them an email
  const signupURL = `http://${req.headers.host}/parent/register/${req.params._id}`;

  mail.send({
    email: req.body.email,
    replyTo: req.user.email,
    filename: "parentSignup",
    subject: `Signup for a NCUJHS dashboard account for ${user.name}`,
    signupURL,
    name: user.name,
  });
  req.flash("success", `you have emailed a parent signup link.`);
  // 4. Redirect to login page
  res.redirect(`/user/${req.params._id}`);
};

exports.parentSignup = async (req, res) => {
  // find the account
  const account = await User.findOne({ _id: req.params._id });
  // check if teacher
  if (account._id) {
    res.render("sendParentSignup", {
      title: `Send a parent signup for ${account.name}`,
      account,
    });
  } else {
    res.redirect("back");
  }
};

exports.sendParentCallbackCount = async (req, res) => {
  // 1. see if the email exists
  const user = await User.findOne({ _id: req.params._id });
  const parents = await User.find({ _id: { $in: user.parent } });
  if (!user) {
    req.flash("error", "No account with that email exists");
    return res.redirect("/");
  }
  parents.forEach((parent) => {
    // 3. Send them an email
    mail.send({
      email: parent.email,
      replyTo: req.user.email,
      filename: "callbackParent",
      subject: `Callback update for ${user.name}`,
      name: user.name,
      callbackCount: user.callbackCount,
      teacher: req.user.name,
    });
  });

  const studentFocus = await new StudentFocus({
    teacher: req.user._id,
    student: user._id,
    comments: `Sent parent email about ${user.callbackCount} items on callback`,
    category: "Parent Contact",
  }).save();

  req.flash("success", `you have emailed ${user.name}'s parent or guardian`);
  // 4. Redirect to login page
  res.redirect(`/user/${req.params._id}`);
};

exports.reportDisciplineToAdmin = async (disciplineId) => {
  const discipline = await Discipline.findOne({ _id: disciplineId });
  const emailAddress = await User.find({ permissions: "disciplineEmail" });
  emailAddress.forEach((user) => {
    mail.send({
      email: user.email,
      replyTo: discipline.teacher.email,
      filename: "reportDiscipline",
      subject: `New Student Conduct Referal for ${discipline.student.name}`,
      teacherName: discipline.teacher.name,
      studentName: discipline.student.name,
      date: discipline.date.toDateString(),
    });
  });
};

exports.reportBullyingToAdmin = async (bullyingID) => {
  const bullying = await Bullying.findOne({ _id: bullyingID });
  const emailAddress = await User.find({ permissions: "bullyingEmail" });
  emailAddress.forEach((user) => {
    mail.send({
      email: user.email,
      replyTo: bullying.author.email,
      filename: "reportDiscipline",
      subject: `New HHB Referal for ${bullying.offender.name} from ${bullying.author.name}`,
      teacherName: bullying.author.name,
      studentName: bullying.offender.name,
      date: bullying.dateReported.toDateString(),
    });
  });
};

exports.reportPhoneToAdmin = async (StudentFocusId) => {
  const studentFocus = await StudentFocus.findOne({ _id: StudentFocusId });
  const emailAddress = await User.find({ permissions: "phoneEmail" });
  emailAddress.forEach((user) => {
    mail.send({
      email: user.email,
      replyTo: studentFocus.teacher.email,
      filename: "reportPhone",
      subject: `New Phone Violation for ${studentFocus.student.name}`,
      teacherName: studentFocus.teacher.name,
      studentName: studentFocus.student.name,
      date: studentFocus.created.toDateString(),
      comments: studentFocus.comments,
    });
  });
};

exports.sendPbisWinners = async (winners) => {
  const pbisSchoolCount = await Pbis.find().countDocuments();
  const emailAddress = await User.find({ permissions: "pbisEmail" });
  emailAddress.forEach((user) => {
    mail.send({
      email: user.email,
      filename: "pbisWeeklyWinners",
      subject: "New weekly PBIS winners",
      winners: winners,
      pbisSchoolCount: pbisSchoolCount,
    });
  });
};
