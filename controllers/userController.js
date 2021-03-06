const mongoose = require("mongoose");
const User = mongoose.model("User");
const Pbis = mongoose.model("Pbis");
const Callback = mongoose.model("Callback");
// const Progress = mongoose.model("Progress");
const promisify = require("es6-promisify");
// const { TRUE } = require("node-sass");
// const { findOneAndUpdate, find } = require("../models/User");
const { getLatestProgresses } = require("../controllers/progressController");
const { permissionList, isStaff } = require("../handlers/permissions");
// const { catchErrors } = require("../handlers/errorHandlers");
updateCheck = (body) => {
  let updates = {};

  if (body.ta) {
    return {
      name: body.name,
      email: body.email,
      ta: body.ta || null,
      block1: body.block1 || null,
      block2: body.block2 || null,
      block3: body.block3 || null,
      block4: body.block4 || null,
      block5: body.block5 || null,
      block6: body.block6 || null,
      block7: body.block7 || null,
      block8: body.block8 || null,
      block9: body.block9 || null,
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
      ta: body.ta || null,
      permissions: body.permissions,
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
  sort["name"] = 1;
  const studentCount = await User.find({
    permissions: "student",
  }).countDocuments();
  const onCallbackCount = await User.find({
    permissions: "student",
    callbackCount: { $ne: 0 },
  }).countDocuments();
  const percentageOnCallback = Math.round(
    100 * (onCallbackCount / studentCount),
  );
  const users = await User.find({
    permissions: "student",
    ta: { $ne: "5ffdf13a07131600177cc07e" },
  }).sort(sort);
  const callbackCount = users.reduce(function (prev, current) {
    const adder = parseInt(current.callbackCount || "0", 10);
    if (current.permissions.includes("teacher")) {
      return prev;
    } else {
      return prev + adder;
    }
  }, 0);
  const studentCallbackCount = users.reduce(function (prev, current) {
    if (current.permissions.includes("teacher")) {
      return prev;
    } else if (current.callbackCount) {
      return prev + 1;
    } else {
      return prev;
    }
  }, 0);

  res.render("searchUser", {
    title: `Search for an account Sorted by ${category}`,
    users,
    callbackCount,
    studentCallbackCount,
    percentageOnCallback,
    studentCount,
  });
};

exports.searchTeachers = async (req, res) => {
  const category = req.params.category || "";
  let sort = {};
  sort[category] = -1;
  sort["name"] = 1;

  const teachers = await User.find({
    $or: [
      { permissions: "teacher" },
      { permissions: "admin" },
      { permissions: "para" },
    ],
  })
    .sort(sort)
    .populate("previousPbisWinner")
    .populate("currentPbisWinner");

  res.render("searchTeacher", {
    title: `Search for an account Sorted by ${category}`,
    teachers,
  });
};

exports.userSearchResult = async (req, res) => {
  // find the account
  const account = await User.findOne({ _id: req.params._id });
  // check if teacher
  if (isStaff(account)) {
    // find their callback
    const callbacks = await Callback.find({
      teacher: account._id,
      completed: "",
    }).sort({
      assigned: 1,
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
    const taStudents = await User.find({ ta: account._id });
    const classStudents = await User.find({
      $or: [
        // { math: account._id },
        // { languageArts: account._id },
        // { socialStudies: account._id },
        // { science: account._id },
        // { trimester1: account._id },
        // { trimester2: account._id },
        // { trimester3: account._id },
        { block1: account._id },
        { block2: account._id },
        { block3: account._id },
        { block4: account._id },
        { block5: account._id },
        { block6: account._id },
        { block7: account._id },
        { block8: account._id },
        { block9: account._id },
      ],
    });
    // const students = [...taStudents, ...classStudents];
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
      taStudents,
      classStudents,
      // ta,
    });
    // student
  } else {
    // find their callback

    const parents = await User.find({ _id: account.parent });
    // find their callback
    const callbacks = await Callback.find({
      student: req.params._id,
      completed: "",
    });
    const pbis = await Pbis.find({
      student: req.params._id,
      category: { $ne: "Physical Card" },
      message: { $ne: "" },
    })
      .sort({ date: -1 })
      .limit(10);
    // console.log("stupid error");
    const progresses = await getLatestProgresses(account._id);

    // const ta = await User.find({ ta: req.params._id });
    res.render("userSearchResult", {
      title: `${account.name}'s details`,
      account,
      callbacks,
      parents,
      pbis,
      progresses,
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
    // math: req.body.math || null,
    // languageArts: req.body.languageArts || null,
    // science: req.body.science || null,
    // socialStudies: req.body.socialStudies || null,
    // trimester1: req.body.trimester1 || null,
    // trimester2: req.body.trimester2 || null,
    // trimester3: req.body.trimester3 || null,
    block1: req.body.block1 || null,
    block2: req.body.block2 || null,
    block3: req.body.block3 || null,
    block4: req.body.block4 || null,
    block5: req.body.block5 || null,
    block6: req.body.block6 || null,
    block7: req.body.block7 || null,
    block8: req.body.block8 || null,
    block9: req.body.block9 || null,
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
  res.render("accountAdmin", {
    title: "Edit account",
    account,
    permissionList,
  });
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
      permissions: "teacher",
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
      permissions: "student",
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
