const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	storage    : multer.memoryStorage(),
	fileFilter(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');
		if (isPhoto) {
			next(null, true);
		} else {
			next({ message: "That filetype isn't allowed!" }, false);
		}
	},
};

exports.homePage = (req, res) => {
	res.render('index', { title: 'Rob is Hangry' });
};

exports.addStore = (req, res) => {
	res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	if (!req.file) {
		next(); //skip to next middleware
		return;
	}
	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	// now we resize
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	//once we have written the photo to file system keep going
	next();
};

exports.createStore = async (req, res) => {
	req.body.author = req.user.id;
	const store = await new Store(req.body).save();
	req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
	res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
	// 1. querey the database
	const stores = await Store.find();
	res.render('stores', { title: 'Stores', stores: stores });
};

const confirmOwner = (store, user) => {
	if (!store.author.equals(user.id)) {
		throw Error('You must own a store in order to edit it!');
	}
};

exports.editStore = async (req, res) => {
	//find the store given id
	const store = await Store.findOne({ _id: req.params.id });

	//confirm they are owner of the store
	confirmOwner(store, req.user);
	//render out the edit form so they can edit
	res.render('editStore', { title: `edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
	// set the location data to be a point
	req.body.location.type = 'Point';
	// find and update store
	const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
		new           : true,
		runValidators : true,
	}).exec();
	// redirect to the store and tell them it worked
	req.flash(
		'success',
		`Sucessfully Updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`,
	);
	res.redirect(`/stores/${store.id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
	console.log('start look');
	const store = await Store.findOne({ slug: req.params.slug });
	if (!store) return next();
	res.render('store', { store, title: store.name });
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

exports.searchStores = async (req, res) => {
	const stores = await Store.find(
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
		.limit(5);
	res.json(stores);
};
// prettier-ignore
exports.mapStores = async (req, res) => {
	const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
	const q = {
	  location: {
		$near: {
		  $geometry: {
			type: 'Point',
			coordinates
		  },
		  $maxDistance: 10000 // 10km
		}
	  }
	};
  
	const stores = await Store.find(q).select('slug name description location photo').limit(10);
	res.json(stores);
  };

exports.mapPage = (req, res) => {
	res.render('map', { title: 'Map' });
};

exports.heartStore = async (req, res) => {
	const hearts = req.user.hearts.map((obj) => obj.toString());
	const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
	const user = await User.findByIdAndUpdate(req.user._id, { [operator]: { hearts: req.params.id } }, { new: true });
	res.json(user);
};
