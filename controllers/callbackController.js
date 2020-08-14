const mongoose = require("mongoose");
const { getStudents } = require("./userController");
const Callback = mongoose.model("Callback");
const User = mongoose.model("User");
// get yesterday's date
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

recountCallback = async (id) => {
  const callback = await Callback.findOne({ _id: id });
  const teacherCount = await Callback.find({
    teacher: callback.teacher,
    completed: "",
  }).count();
  const studentCount = await Callback.find({
    student: callback.student,
    completed: "",
  }).count();
  const teacher = await User.findOneAndUpdate(
    { _id: callback.teacher },
    { callbackCount: teacherCount },
  ).exec();
  const student = await User.findOneAndUpdate(
    { _id: callback.student },
    { callbackCount: studentCount },
  ).exec();
};

exports.addCallback = (req, res) => {
  res.render("editCallback", { title: "Add Callback" });
};

exports.createCallback = async (req, res) => {
  req.body.teacher = req.user.id;
  const callback = await new Callback(req.body).save();
  recountCallback(callback._id);
  req.flash("success", `Successfully Created ${callback.assignment}.`);
  res.redirect(`/callback/${callback._id}`);
};

exports.getCallbackByTeacher = async (req, res) => {
  // 1. querey the database
  const callbacks = await Callback.find({
    teacher: req.user._id,
    completed: "",
  }).sort({ Date: 1 });
  res.render("callbacks", { title: "callback", callbacks: callbacks });
};

exports.getCallbackByStudent = async (req, res) => {
  // 1. querey the database
  const callbacks = await Callback.find({
    student: req.user._id,
    completed: "",
  }).sort({ Date: 1 });
  res.render("callbacks", { title: "callback", callbacks: callbacks });
};
exports.getallCallbackByTeacher = async (req, res) => {
  // 1. querey the database
  const callbacks = await Callback.find({
    teacher: req.user._id,
  }).sort({ Date: 1 });
  res.render("callbacks", { title: "callback", callbacks: callbacks });
};

const confirmOwner = (callback, user) => {
  if (!callback.teacher.equals(user._id)) {
    throw Error("You must own an event in order to edit it!");
  }
};

exports.editCallback = async (req, res) => {
  //find the event given id
  const callback = await Callback.findOne({ _id: req.params._id });
  //confirm they are owner of the event
  confirmOwner(callback, req.user);
  //render out the edit form so they can edit
  res.render("editCallback", {
    title: `edit ${callback.assignment}`,
    callback,
  });
};
exports.duplicateCallback = async (req, res) => {
  //find the event given id
  let callback = await Callback.findOne(
    { _id: req.params._id },
    { _id: 0, student: 0 },
  );
  //confirm they are owner of the event
  confirmOwner(callback, req.user);

  //render out the edit form so they can edit
  res.render("editCallback", {
    title: `add another copy of ${callback.assignment}`,
    callback,
  });
};

exports.updateCallback = async (req, res) => {
  // find and update store
  const callback = await Callback.findOneAndUpdate(
    { _id: req.params._id },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  ).exec();
  // redirect to the store and tell them it worked
  if (req.body.student) {
    req.flash(
      "success",
      `Sucessfully Updated <strong>${callback.assignment}</strong>.`,
    );
    res.redirect(`/callback/${callback._id}`);
  } else {
    req.flash(
      "success",
      `Sucessfully Checked off <strong>${callback.assignment}</strong>.`,
    );
    recountCallback(callback._id);
    res.redirect("back");
  }
};

exports.searchCallback = async (req, res) => {
  const users = await User.find(
    {
      $text: {
        $search: req.query.q,
      },
      isTeacher: false,
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

exports.getCallbackByID = async (req, res, next) => {
  const callback = await Callback.findOne({ _id: req.params._id });
  if (!callback) return next();
  const editable = callback.teacher.equals(req.user._id);
  const owner = editable || callback.student.equals(req.user._id);
  res.render("callback", {
    callback,
    editable,
    owner,
    title: callback.assignment,
  });
};
