const mongoose = require("mongoose");
const Calendar = mongoose.model("Calendar");
const Callback = mongoose.model("Callback");
const User = mongoose.model("User");
// get yesterday's date
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

exports.addEvent = (req, res) => {
  res.render("editEvent", { title: "Add Event" });
};

exports.createEvent = async (req, res) => {
  req.body.author = req.user.id;
  const calendar = await new Calendar(req.body).save();
  req.flash("success", `Successfully Created ${calendar.title}.`);
  res.redirect(`/calendar/${calendar._id}`);
};

exports.getEvents = async (req, res) => {
  const timeOffset = 2 * 86400000;
  // 1. querey the database
  let calendars = {};
  if (req.user) {
    // check if teacher for calendar events
    if (req.user.isTeacher) {
      calendars = await Calendar.find({
        Date: { $gte: new Date() - timeOffset },
      })
        .sort({ Date: 1 })
        .limit(8);
    } else {
      calendars = await Calendar.find({
        Date: { $gte: new Date() - timeOffset },
        teachersOnly: "",
      })
        .sort({ Date: 1 })
        .limit(8);
    }
  }
  res.render("calendars", { title: "Calendar", calendars: calendars });
};

exports.getAllEvents = async (req, res) => {
  // 1. querey the database
  // check if logged in
  let calendars = {};
  if (req.user) {
    // check if teacher for calendar events
    if (req.user.isTeacher) {
      calendars = await Calendar.find().sort({ Date: 1 });
    } else {
      calendars = await Calendar.find({
        teachersOnly: "",
      }).sort({ Date: 1 });
    }
  }

  res.render("calendars", { title: "Calendar", calendars: calendars });
};

exports.dashboard = async (req, res) => {
  const timeOffset = 1 * 86400000;
  // 1. querey the database
  let calendars = {};
  let callbacks = {};
  let students = {};
  
  // check if logged in
  if (req.user) {
    // check if teacher for calendar events
    if (req.user.isTeacher) {
      calendars = await Calendar.find({
        Date: { $gte: new Date() - timeOffset, $lte: new Date() + timeOffset },
      }).sort({ Date: 1 });
    } else {
      calendars = await Calendar.find({
        Date: { $gte: new Date() - timeOffset, $lte: new Date() + timeOffset },
        teachersOnly: "",
      }).sort({ Date: 1 });
    }
    // if (req.user.isTeacher) {
    //   ids = await User.find({ ta: req.user._id });
    //   idArray = ids.map(function (id) {
    //     return id._id;
    //   });
    // }

    // find TA students
    if (req.user.isTeacher) {
      ids = await User.find({ ta: req.user._id });
      idArray = ids.map(function (id) {
        return id._id;
      });
      // Find Callback Assignments
      callbacks = await Callback.find({
        $or: [
          {
            $and: [
              { teacher: req.user._id },
              { message: { $exists: true, $ne: "" } },
            ],
          },
          { student: { $in: idArray } },
        ],

        completed: "",
      }).sort({ message: -1, date: 1 });
    } else if (req.user.isParent) {
      callbacks = await Callback.find({
        $or: [{ student: req.user.child }],
        completed: "",
      }).sort({ message: -1, date: 1 });
    } else {
      callbacks = await Callback.find({
        $or: [{ student: req.user._id }],
        completed: "",
      }).sort({ message: -1, date: 1 });
    }
    // if parent find student
    if (req.user.isParent) {
      students = await User.find({ parent: req.user.parent } )
    };
  }

  res.render("dashboard", {
    title: "N.C.U.J.H.S. Dashboard ",
    calendars: calendars,
    callbacks: callbacks,
    students: students || null
  });
};

const confirmOwner = (calendar, user) => {
  if (!calendar.author.equals(user._id)) {
    throw Error("You must own an event in order to edit it!");
  }
};

exports.editEvent = async (req, res) => {
  //find the event given id
  const calendar = await Calendar.findOne({ _id: req.params._id });

  //confirm they are owner of the event or admin
  if (!req.user.isAdmin) {
    confirmOwner(calendar, req.user);
  }

  //render out the edit form so they can edit
  res.render("editEvent", { title: `edit ${calendar.title}`, calendar });
};

exports.updateEvent = async (req, res) => {
  // find and update store
  const calendar = await Calendar.findOneAndUpdate(
    { _id: req.params._id },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  ).exec();
  // redirect to the store and tell them it worked
  req.flash(
    "success",
    `Sucessfully Updated <strong>${calendar.title}</strong>. <a href="/calendar/${calendar._id}">View Event</a>`,
  );
  res.redirect(`/calendar/${calendar._id}/edit`);
};

exports.searchEvent = async (req, res) => {
  const calendars = await Calendar.find(
    {
      $text: {
        $search: req.query.q,
      },
    },
    {
      score: { $meta: "textScore" },
    },
  )
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(10);
  res.json(calendars);
};

exports.getEventByID = async (req, res, next) => {
  const calendar = await Calendar.findOne({ _id: req.params._id });
  if (!calendar) return next();
  const editable =
    calendar.author.equals(req.user._id) || req.user.isAdmin === "true";
  res.render("calendar", { calendar, editable, title: calendar.title });
};
