const mongoose = require('mongoose');
const Calendar = mongoose.model('Calendar');
const Callback = mongoose.model('Callback');
const User = mongoose.model('User');
// get yesterday's date
const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)


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
	const timeOffset = 2*86400000;
	// 1. querey the database
	const calendars = await Calendar.find(
		{
			Date: {$gte: new Date()-timeOffset}
		}
	).sort({Date: 1});
	res.render('calendars', { title: 'Calendar', calendars: calendars });
};

exports.getTodaysEvents = async (req, res) => {
	const timeOffset = 1*86400000;
	// 1. querey the database
	const calendars = await Calendar.find(
		{
			Date: {$gte: new Date()-timeOffset,
				$lte: new Date()+timeOffset,}
		}
	).sort({Date: 1});
	const callbacks = await Callback.find(
		{
			student: req.user._id,
			completed: false
		}
	).sort({date: 1});
	res.render('dashboard', { title: 'Todays Events! ', calendars: calendars, callbacks: callbacks });
};

const confirmOwner = (calendar, user) => {
	if (!calendar.author.equals(user._id)) {
		throw Error('You must own an event in order to edit it!');
	}
};

exports.editEvent = async (req, res) => {
	//find the event given id
	const calendar = await Calendar.findOne({ _id: req.params._id });

	//confirm they are owner of the event
	confirmOwner(calendar, req.user);
	//render out the edit form so they can edit
	res.render('editEvent', { title: `edit ${calendar.title}`, calendar });
};

exports.updateEvent = async (req, res) => {
	
	// find and update store
	const calendar = await Calendar.findOneAndUpdate({ _id: req.params._id }, req.body, {
		new           : true,
		runValidators : true,
	}).exec();
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
			$text : {
				$search : req.query.q,
			},
		},
		{
			score : { $meta: 'textScore' },
		},
	)
	.sort({
		score : { $meta: 'textScore' },
		})
		.limit(10);
		res.json(calendars);
	};

exports.getEventByID = async (req, res, next) => {
	const calendar = await Calendar.findOne({ _id: req.params._id });
	if (!calendar) return next();
	const editable = calendar.author.equals(req.user._id)
	res.render('calendar', { calendar, editable, title: calendar.title });
};

exports.getStoresByTag = async (req, res) => {
	const tag = req.params.tag;
	const tagQuerey = tag || { $exists: true };
	const tagsPromise = Store.getTagsList();
	const storesPromise = Store.find({ tags: tagQuerey });
	const [
		tags,
		stores,
	] = await Promise.all([
		tagsPromise,
		storesPromise,
	]);

	res.render('tag', { tags, title: 'Tags', tag, stores });
};