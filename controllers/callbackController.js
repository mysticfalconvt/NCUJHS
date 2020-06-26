const mongoose = require('mongoose');
const Callback = mongoose.model('Callback');
const User = mongoose.model('User');
// get yesterday's date
const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)


exports.addCallback = (req, res) => {
	res.render('editCallback', { title: 'Add Callback' });
};


exports.createCallback = async (req, res) => {
	req.body.teacher = req.user.id;
	const callback = await new Callback(req.body).save();
	req.flash('success', `Successfully Created ${callback.assignment}.`);
	res.redirect(`/callback/${callback._id}`);
};

exports.getCallbackByTeacher = async (req, res) => {
	
	// 1. querey the database
	const callbacks = await Callback.find(
		{
			teacher: req.user._id
		}
	).sort({Date: 1});
	res.render('callbacks', { title: 'callback', callbacks: callbacks });
};

exports.getTodaysEvents = async (req, res) => {
	const timeOffset = 1*86400000;
	// 1. querey the database
	const callbacks = await callback.find(
		{
			Date: {$gte: new Date()-timeOffset,
				$lte: new Date()+timeOffset,}
		}
	).sort({Date: 1});
	res.render('callbacks', { title: 'Todays Events! ', callbacks: callbacks });
};

const confirmOwner = (callback, user) => {
	if (!callback.teacher.equals(user._id)) {
		throw Error('You must own an event in order to edit it!');
	}
};

exports.editCallback = async (req, res) => {
	//find the event given id
	const callback = await Callback.findOne({ _id: req.params._id });

	//confirm they are owner of the event
	confirmOwner(callback, req.user);
	//render out the edit form so they can edit
	res.render('editCallback', { title: `edit ${callback.assignment}`, callback });
};

exports.updateCallback = async (req, res) => {
	
	// find and update store
	const callback = await Callback.findOneAndUpdate({ _id: req.params._id }, req.body, {
		new           : true,
		runValidators : true,
	}).exec();
	// redirect to the store and tell them it worked
	req.flash(
		'success',
		`Sucessfully Updated <strong>${callback.assignment}</strong>. <a href="/callback/${callback._id}">View Event</a>`,
	);
	res.redirect(`/callback/${callback._id}/edit`);
};


exports.searchCallback = async (req, res) => {
	const callbacks = await callback.find(
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
		res.json(callbacks);
	};

exports.getCallbackByID = async (req, res, next) => {
	const callback = await Callback.findOne({ _id: req.params._id });
	if (!callback) return next();
	res.render('callback', { callback, title: callback.title });
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