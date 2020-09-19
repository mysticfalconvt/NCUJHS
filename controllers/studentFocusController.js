const mongoose = require("mongoose");
const { findOneAndUpdate } = require("../models/User");
const StudentFocus = mongoose.model("studentFocus");
const User = mongoose.model("User");

updateCellCount = async (student) => {
  const cellphoneCount = await StudentFocus.find({
    student: student,
    category: "Cell Phone Violation",
  }).countDocuments();
  const user = await User.findOneAndUpdate(
    { _id: student },
    { cellPhoneCount: cellphoneCount },
    {
      new: true,
      runValidators: true,
    },
  );
};

exports.addStudentFocus = (req, res) => {
  res.render("editStudentFocus", { title: "Add Student Focus" });
};

exports.getStudentFocus = async (req, res) => {
  const category = req.params.category;
  let studentFocuss = {};
  if (req.user) {
    // check if teacher for calendar events
    if (req.user.isTeacher || req.user.isAdmin || req.user.isPara) {
      let sort = {};
      sort[category] = -1;
      sort["name"] = 1;
      studentFocuss = await StudentFocus.find().sort(sort);
    } else {
      studentFocuss = {};
    }
  } else {
    studentFocuss = {};
  }
  res.render("studentFocuss", {
    title: "Student Focus",
    studentFocuss: studentFocuss,
    id: "",
  });
};
exports.getOneStudentFocus = async (req, res) => {
  const category = req.params.category;
  const id = req.params._id || "";
  let studentFocuss = {};
  if (req.user) {
    // check if teacher for calendar events
    if (req.user.isTeacher || req.user.isAdmin || req.user.isPara) {
      let sort = {};
      sort[category] = -1;
      sort["name"] = 1;
      studentFocuss = await StudentFocus.find({
        $or: [{ student: req.params._id }, { teacher: req.params._id }],
      }).sort(sort);
    } else {
      studentFocuss = {};
    }
  } else {
    studentFocuss = {};
  }
  res.render("studentFocuss", {
    title: "Student Focus",
    studentFocuss: studentFocuss,
    id: id,
  });
};

exports.createStudentFocus = async (req, res) => {
  req.body.teacher = req.user.id;
  const studentFocus = await new StudentFocus(req.body).save();
  const isCellPhone = req.body.category == "Cell Phone Violation";
  if (isCellPhone) {
    updateCellCount(req.body.student);
  }
  req.flash("success", `Successfully Created`);
  res.redirect(`/studentFocus/search/category`);
};

exports.updateStudentFocus = async (req, res) => {
  // find and update store
  const studentFocus = await StudentFocus.findOneAndUpdate(
    { _id: req.params._id },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  ).exec();
  const isCellPhone = req.body.category == "Cell Phone Violation";
  if (isCellPhone) {
    updateCellCount(req.body.student);
  }
  // redirect to the store and tell them it worked
  req.flash(
    "success",
    `Sucessfully Updated <strong>${studentFocus.category}</strong>.`,
  );
  res.redirect(`/studentFocus/search/category`);
};

exports.editStudentFocus = async (req, res) => {
  //find the event given id
  const studentFocus = await StudentFocus.findOne({ _id: req.params._id });

  //confirm they are owner of the event or admin
  if (!req.user.isAdmin) {
    confirmOwner(studentFocus, req.user);
  }

  //render out the edit form so they can edit
  res.render("editStudentFocus", {
    title: `edit ${studentFocus.student.name}'s ${studentFocus.category}`,
    studentFocus,
  });
};
