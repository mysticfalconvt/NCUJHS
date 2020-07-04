const mongoose = require('mongoose');
const { getStudents } = require('./userController');
const Callback = mongoose.model('Callback');
const User = mongoose.model('User');
// get yesterday's date
const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)



exports.addCallback = async (req, res) => {
	const users = await User.find({isTeacher: false, isAdmin: false},{name: 1}).sort({name: 1});
	studentList = users.map(function(singleUser) {
		 return singleUser['name']});
	
	res.render('editCallback', { title: 'Add Callback', students: studentList });
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
			teacher: req.user._id,
			completed: false
		}
	).sort({Date: 1});
	res.render('callbacks', { title: 'callback', callbacks: callbacks });
};

exports.getCallbackByStudent = async (req, res) => {
	
	// 1. querey the database
	const callbacks = await Callback.find(
		{
			student: req.user._id,
			completed: false
		}
	).sort({Date: 1});
	res.render('callbacks', { title: 'callback', callbacks: callbacks });
};
exports.getallCallbackByTeacher = async (req, res) => {
	
	// 1. querey the database
	const callbacks = await Callback.find(
		{
			teacher: req.user._id
		}
	).sort({Date: 1});
	res.render('callbacks', { title: 'callback', callbacks: callbacks });
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
	const users = await User.find(
		{
			$text : {
				$search : req.query.q,
			},
			isTeacher : false
		},
		{
			score : { $meta: 'textScore' },
		},
	)
	.sort({
		score : { $meta: 'textScore' },
		})
		.limit(10);
		res.json(users);
	};

exports.getCallbackByID = async (req, res, next) => {
	const callback = await Callback.findOne({ _id: req.params._id });
	if (!callback) return next();
	const editable = callback.teacher.equals(req.user._id)
	res.render('callback', { callback, editable, title: callback.title });
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