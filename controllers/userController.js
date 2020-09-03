const mongoose = require("mongoose");
const User = mongoose.model("User");
const Pbis = mongoose.model("Pbis");
const Callback = mongoose.model("Callback");
const promisify = require("es6-promisify");
const { TRUE } = require("node-sass");
const { findOneAndUpdate, find } = require("../models/User");

updateCheck = (body) => {
  if (body.ta) {
    return {
      name: body.name,
      email: body.email,
      ta: body.ta,
      isTeacher: body.isTeacher,
      isAdmin: body.isAdmin,
      math: body.math || null,
      languageArts: body.languageArts || null,
      science: body.science || null,
      socialStudies: body.socialStudies || null,
      trimester1: body.trimester1 || null,
      trimester2: body.trimester2 || null,
      trimester3: body.trimester3 || null,
    };
  } else if (body.currentAssignment) {
    return {
      name: body.name,
      email: body.email,
      currentAssignment: body.currentAssignment,
    };
  } else {
    return {
      name: body.name,
      email: body.email,
      isTeacher: body.isTeacher,
      isAdmin: body.isAdmin,
      isPara: body.isPara,
      ta: body.ta || null,
    };
  }
};

exports.loginForm = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};

exports.registerParentForm = async (req, res) => {
  const student = await User.findOne({ _id: req.params._id });
  res.render("registerParent", { title: "Register", student });
};

exports.searchUser = async (req, res) => {
  const category = req.params.category || "";
  let sort = {};
  sort[category] = -1;
  // sort["isTeacher"] = 1;
  // sort["isAdmin"] = 1;
  // sort["isPara"] = 1;
  sort["name"] = 1;
  const studentCount = await User.find({
    isParent: { $ne: true },
    isTeacher: { $ne: true },
    isAdmin: { $ne: true },
    isPara: { $ne: true },
  }).countDocuments();
  const onCallbackCount = await User.find({
    isParent: { $ne: true },
    isTeacher: { $ne: true },
    isAdmin: { $ne: true },
    isPara: { $ne: true },
    callbackCount: { $ne: 0 },
  }).countDocuments();
  const percentageOnCallback = Math.round(
    100 * (onCallbackCount / studentCount),
  );
  const users = await User.find({
    isParent: { $ne: true },
    isTeacher: { $ne: true },
    isAdmin: { $ne: true },
    isPara: { $ne: true },
  }).sort(sort);
  const callbackCount = users.reduce(function (prev, current) {
    const adder = parseInt(current.callbackCount || "0", 10);
    if (current.isTeacher) {
      return prev;
    } else {
      return prev + adder;
    }
  }, 0);
  const studentCallbackCount = users.reduce(function (prev, current) {
    if (current.isTeacher) {
      return prev;
    } else if (current.callbackCount) {
      return prev + 1;
    } else {
      return prev;
    }
  }, 0);

  res.render("searchUser", {
    title: `Search for an account by ${category}`,
    users,
    callbackCount,
    studentCallbackCount,
    percentageOnCallback,
    studentCount,
  });
};

exports.userSearchResult = async (req, res) => {
  // find the account
  const account = await User.findOne({ _id: req.params._id });
  // check if teacher
  if (account.isTeacher || account.isAdmin || account.isPara) {
    // find their callback
    const callbacks = await Callback.find({ teacher: account._id }).sort({
      completed: 1,
    });
    const completedCallback = await Callback.countDocuments({
      teacher: account._id,
      completed: "true",
    });
    const totalCallback = (account.callbackCount | 0) + (completedCallback | 0);
    const respect = await Pbis.countDocuments({
      teacher: account._id,
      category: "Respect",
    });
    const responsibility = await Pbis.countDocuments({
      teacher: account._id,
      category: "Responsibility",
    });
    const perserverance = await Pbis.countDocuments({
      teacher: account._id,
      category: "Perserverance",
    });
    const pbisCardCount =
      (respect | 0) + (responsibility | 0) + (perserverance | 0);

    //render out the edit form so they can edit
    res.render("teacherDetails", {
      title: `${account.name}'s Details`,
      account,
      callbacks,
      pbisCardCount,
      respect,
      responsibility,
      perserverance,
      completedCallback,
      totalCallback,
      // ta,
    });
    // student
  } else {
    // find their callback

    const callbacks = await Callback.find({
      student: req.params._id,
      completed: "",
    });
    // find their callback
    // const ta = await User.find({ ta: req.params._id });
    //render out the edit form so they can edit
    res.render("userSearchResult", {
      title: `${account.name}'s details`,
      account,
      callbacks,

      // ta,
    });
  }
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("email", "That Email is not valid!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody("password", "Password Cannot be Blank!").notEmpty();
  req
    .checkBody("password-confirm", "Confirmed Password cannot be blank!")
    .notEmpty();
  req
    .checkBody("password-confirm", "Oops! Your passwords do not match")
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash(
      "error",
      errors.map((err) => err.msg),
    );
    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash(),
    });
    return; // stop the fn from running
  }
  next(); // there were no errors!
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
    child: req.body.child || null,
    isParent: req.body.isParent || "",
    ta: req.body.ta || null,
    math: req.body.math || null,
    languageArts: req.body.languageArts || null,
    science: req.body.science || null,
    socialStudies: req.body.socialStudies || null,
    trimester1: req.body.trimester1 || null,
    trimester2: req.body.trimester2 || null,
    trimester3: req.body.trimester3 || null,
  });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  if (user.child) {
    const updates = { parent: user._id };
    const student = await User.findOneAndUpdate(
      { _id: user.child },
      { $push: updates },
      { new: true, runValidators: true, context: "query" },
    );
  }
  next(); // pass to authController.login
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit your account" });
};

exports.editAccount = async (req, res) => {
  // find the account
  const account = await User.findOne({ _id: req.params._id });
  res.render("accountAdmin", { title: "Edit account", account });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: "query" },
  );
  req.flash("success", "Updated the profile!");
  res.redirect("/");
};
exports.adminUpdateAccount = async (req, res) => {
  const updates = updateCheck(req.body);
  const user = await User.findOneAndUpdate(
    { _id: req.body.id },
    { $set: updates },
    { new: true, runValidators: true, context: "query" },
  );
  req.flash("success", `Successfully updated ${req.body.name}`);
  res.redirect("/");
};
exports.updateCurrentWork = async (req, res) => {
  const updates = { currentAssignment: req.body.currentAssignment };
  const user = await User.findOneAndUpdate(
    { _id: req.body.id },
    { $set: updates },
    { new: true, context: "query" },
  );
  req.flash(
    "success",
    `Successfully updated current assignment to ${req.body.currentAssignment}`,
  );
  res.redirect("/");
};

//API
exports.searchTeacher = async (req, res) => {
  const users = await User.find(
    {
      $text: {
        $search: req.query.q,
      },
      isTeacher: "true",
    },
    {
      score: { $meta: "textScore" },
    },
  )
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(10);
  res.json(users);
};
exports.searchStudent = async (req, res) => {
  const users = await User.find(
    {
      $text: {
        $search: req.query.q,
      },
      isTeacher: "",
      isAdmin: "",
      isParent: "",
    },
    {
      score: { $meta: "textScore" },
    },
  )
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(10);
  res.json(users);
};

exports.searchAll = async (req, res) => {
  const users = await User.find(
    {
      $text: {
        $search: req.query.q,
      },
      isParent: { $ne: "true" },
    },
    {
      score: { $meta: "textScore" },
    },
  )
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(10);
  res.json(users);
};
