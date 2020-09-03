const passport = require("passport");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");
const mail = require("../handlers/mail");

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed Login",
  successRedirect: "/",
  successFlash: "You are now logged in",
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash("error", "You must be logged in");
  res.redirect("/login");
};
exports.isTeacher = (req, res, next) => {
  if (req.user.isTeacher || req.user.isAdmin || req.user.isPara) {
    next();
    return;
  }
  req.flash("error", "You must be logged in as a teacher");
  res.redirect("/");
};

exports.forgot = async (req, res) => {
  // 1. see if the email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("error", "No account with that email exists");
    return res.redirect("/login");
  }
  // 3. Send them an email
  const resetURL = `http://${req.headers.host}/account/reset/`;

  mail.send({
    user,
    filename: "password-reset",
    subject: "Password Reset",
    resetURL,
  });

  req.flash("success", `you have been emailed a password reset link.`);
  // 4. Redirect to login page
  res.redirect("/login");
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    _id: req.params._id,
  });

  if (!user) {
    req.flash("error", "Password reset is invalid or has expired");
    return res.redirect("/login");
  }
  res.render("reset", { title: `Reset Password for ${user.name}` });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body["password-confirm"]) {
    next(); //keep going
    return;
  }
  req.flash("error", "Passwords do not match");
  res.redirect("back");
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    _id: req.params._id,
  });

  if (!user) {
    req.flash("error", "Password reset is invalid or has expired");
    return res.redirect("/login");
  }
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  // await req.login(updatedUser);
  req.flash("success", `Nice! You reset ${updatedUser.name}'s password!`);
  res.redirect("/");
};
