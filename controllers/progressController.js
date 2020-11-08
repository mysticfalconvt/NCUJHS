const mongoose = require("mongoose");
const { update } = require("../models/User");
const { userSearchResult } = require("./userController");
const Progress = mongoose.model("Progress");
const User = mongoose.model("User");

exports.addProgress = async (req, res) => {
  const block = req.params.block;
  const sort = {};
  sort[block] = req.user._id;
  const students = await User.find(sort);
  if (Boolean(students[0])) {
    res.render("progress", {
      title: "Log Progress Report",
      students: students,
    });
  } else {
    res.render("progress", {
      title: "Progress Reporting",
      students: false,
    });
  }
};

exports.updateProgress = async (req, res) => {
  const updates = [];
  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      item = req.body[key];
      if (item >= 0) {
        const update = {
          teacher: req.user._id,
          student: key,
          rating: item,
          class: req.user.teacherSubject,
        };
        updates.push(update);
      }
    }
  }
  const progressUpdates = await Progress.insertMany(updates);
  res.redirect("/myProgress");
  // res.render("progress", {
  //   title: "Progress Report",
  //   student: students,
  // });
};

exports.displayProgresses = async (req, res) => {
  progressUpdates = await Progress.find({ teacher: req.user._id }).sort({
    created: -1,
  });
  res.render("progressDisplay", {
    title: "View Progress Reports",
    progresses: progressUpdates,
  });
};

const getLatestProgressAndAverage = async (studentId, className) => {
  const numberOfProgresses = await Progress.aggregate([
    { $match: { student: studentId, class: className } },
    { $group: { _id: null, average: { $avg: "$rating" } } },
  ]);
  const averageRating = numberOfProgresses[0].average;
  const latestClassProgress = await Progress.find({
    student: studentId,
    class: className,
  })
    .sort({ created: 1 })
    .limit(1);
  latestClassProgress[0].average = averageRating;
  return latestClassProgress[0];
};

exports.getLatestProgresses = async (studentId) => {
  let progresses = [];

  const classNames = await Progress.distinct("class", { student: studentId });
  for (let className of classNames) {
    const latest = await getLatestProgressAndAverage(studentId, className);
    progresses.push(latest);
  }
  return progresses;
};
