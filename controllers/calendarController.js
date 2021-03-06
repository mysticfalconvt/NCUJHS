const mongoose = require('mongoose');
const PbisTeam = require('../models/PbisTeam');
const Calendar = mongoose.model('Calendar');
const Callback = mongoose.model('Callback');
const Pbis = mongoose.model('Pbis');
const User = mongoose.model('User');
const DashboardLinks = mongoose.model('DashboardLinks');
const { getLatestProgresses } = require('../controllers/progressController');
const { isStaff } = require('../handlers/permissions');
// get yesterday's date
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

exports.addEvent = (req, res) => {
  res.render('editEvent', { title: 'Add Event' });
};

exports.createEvent = async (req, res) => {
  req.body.author = req.user.id;
  const calendar = await new Calendar(req.body).save();
  req.flash('success', `Successfully Created ${calendar.title}.`);
  res.redirect(`/calendar/${calendar._id}`);
};

exports.getEvents = async (req, res) => {
  const timeOffset = 2 * 86400000;
  // 1. querey the database
  let calendars = {};
  if (req.user) {
    // check if teacher for calendar events
    if (isStaff(req.user)) {
      calendars = await Calendar.find({
        Date: { $gte: new Date() - timeOffset },
        deleted: { $ne: 'true' },
      })
        .sort({ Date: 1 })
        .limit(12);
    } else {
      calendars = await Calendar.find({
        Date: { $gte: new Date() - timeOffset },
        teachersOnly: '',
        deleted: { $ne: 'true' },
      })
        .sort({ Date: 1 })
        .limit(12);
    }
  } else {
    calendars = await Calendar.find({
      Date: { $gte: new Date() - timeOffset },
      teachersOnly: '',
      deleted: { $ne: 'true' },
    })
      .sort({ Date: 1 })
      .limit(12);
  }
  res.render('calendars', { title: 'Calendar', calendars: calendars });
};

exports.getAllEvents = async (req, res) => {
  // 1. querey the database
  // check if logged in
  let calendars = {};
  if (req.user) {
    // check if teacher for calendar events
    if (isStaff(req.user)) {
      calendars = await Calendar.find({ deleted: { $ne: 'true' } }).sort({
        Date: 1,
      });
    } else {
      calendars = await Calendar.find({
        teachersOnly: '',
        deleted: { $ne: 'true' },
      }).sort({ Date: 1 });
    }
  }

  res.render('calendars', { title: 'Calendar', calendars: calendars });
};

exports.dashboard = async (req, res) => {
  const timeOffset = 1 * 86400000;
  // 1. querey the database
  let calendars = {};
  let callbacks = {};
  let students = {};
  let pbis = {};
  const schoolWidePbisData = await PbisTeam.findOne({ schoolWide: true });
  const pbisSchoolCount = await Pbis.find().countDocuments();
  let progresses = [];
  let links = await DashboardLinks.find({
    $and: [
      { permissions: { $in: req?.user?.permissions } },
      { deleted: { $ne: 'true' } },
    ],
  });
  // check if logged in
  if (req.user) {
    // check if teacher for calendar events
    if (isStaff(req.user)) {
      calendars = await Calendar.find({
        Date: { $gte: new Date() - timeOffset, $lte: new Date() + timeOffset },
        deleted: { $ne: 'true' },
      }).sort({ Date: 1 });
    } else {
      calendars = await Calendar.find({
        Date: { $gte: new Date() - timeOffset, $lte: new Date() + timeOffset },
        teachersOnly: '',
        deleted: { $ne: 'true' },
      }).sort({ Date: 1 });
    }

    // find TA students
    if (req.user.permissions.includes('teacher')) {
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
              { message: { $exists: true, $ne: '' } },
            ],
          },
          { student: { $in: idArray } },
        ],

        completed: '',
      }).sort({ message: -1, date: 1 });
    } else if (req.user.permissions.includes('parent')) {
      const children = await User.find({ parent: req.user._id }, { _id: 1 });
      callbacks = await Callback.find({
        $or: [{ student: { $in: children } }],
        completed: '',
      }).sort({ message: -1, date: 1 });
    } else {
      callbacks = await Callback.find({
        $or: [{ student: req.user._id }],
        completed: '',
      }).sort({ message: -1, date: 1 });
      pbis = await Pbis.find({
        student: req.user._id,
        message: { $ne: '' },
        category: { $ne: 'Physical Card' },
      })
        .sort({ date: -1 })
        .limit(10);
      progresses = await getLatestProgresses(req.user ? req.user._id : null);
    }
    // if parent find student
    if (req.user.permissions.includes('parent')) {
      students = await User.find({ parent: req.user._id });
      pbis = await Pbis.find({
        student: { $in: students },
        message: { $ne: '' },
      })
        .sort({ date: 1 })
        .limit(10);
      // console.log(progresses);
      for (let student of students) {
        // console.log(student._id);
        const progress = await getLatestProgresses(student._id);
        progresses.push(...progress);
      }
      // console.log(progresses);
    }
  }
  const datesToShow = schoolWidePbisData.weeksToDisplay;
  const quantityToShow = schoolWidePbisData.cardsPerWeek;
  const cumulativeSum = ((sum) => (value) => (sum += value))(0);
  const cumulativeQuantity = quantityToShow.map(cumulativeSum);
  res.render('dashboard', {
    title: 'NCUJHS Dashboard ',
    calendars: calendars,
    callbacks: callbacks,
    student: students || null,
    pbis: pbis,
    pbisSchoolCount: pbisSchoolCount,
    schoolWidePbisData: schoolWidePbisData,
    progresses,
    links,
    datesToShow,
    quantityToShow: cumulativeQuantity,
  });
};

const confirmOwner = (calendar, user) => {
  if (!calendar.author.equals(user._id)) {
    throw Error('You must own an event in order to edit it!');
  }
};

exports.editEvent = async (req, res) => {
  //find the event given id
  const calendar = await Calendar.findOne({ _id: req.params._id });

  //confirm they are owner of the event or admin
  if (!req.user.permissions.includes('admin')) {
    confirmOwner(calendar, req.user);
  }

  //render out the edit form so they can edit
  res.render('editEvent', { title: `edit ${calendar.title}`, calendar });
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
    'success',
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
      deleted: { $ne: 'true' },
    },
    {
      score: { $meta: 'textScore' },
    },
  )
    .sort({
      score: { $meta: 'textScore' },
    })
    .limit(10);
  res.json(calendars);
};

exports.getEventByID = async (req, res, next) => {
  const calendar = await Calendar.findOne({ _id: req.params._id });
  if (!calendar || !calendar.author) return next();

  const editable =
    calendar.author.equals(req.user._id) ||
    req.user.permissions.includes('admin');
  res.render('calendar', { calendar, editable, title: calendar.title });
};
