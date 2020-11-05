const mongoose = require("mongoose");
const { update } = require("../models/User");
const { userSearchResult } = require("./userController");
const Progress = mongoose.model("Progress");
const User = mongoose.model("User");

exports.addProgress = async (req, res) => {
  students = await User.find({ math: req.user._id });
  res.render("progress", {
    title: "Progress Report",
    student: students,
  });
};

exports.updateProgress = async (req, res) => {
  const updates = [];
  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      item = req.body[key];
      if (item > 0) {
        console.log("stuffffff");
        update = { teacher: req.user._id, student: key, rating: item };
        updates.push(update);
      }
    }
  }
  console.log(updates);
  const progressUpdates = await Progress.insertMany(updates);
  res.json(progressUpdates);
  // res.render("progress", {
  //   title: "Progress Report",
  //   student: students,
  // });
};
