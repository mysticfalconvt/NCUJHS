const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");
const mail = require("../handlers/mail");
const StudentFocus = mongoose.model("studentFocus");

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
    console.log(parent.name);
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

  // const studentFocus = await new StudentFocus({
  //   teacher: req.user._id,
  //   student: user._id,
  //   comments: `Sent parent email about ${user.callbackCount} items on callback`,
  //   category: "Parent Contact",
  // }).save();

  req.flash("success", `you have emailed ${user.name}'s parent or guardian`);
  // 4. Redirect to login page
  res.redirect(`/user/${req.params._id}`);
};
