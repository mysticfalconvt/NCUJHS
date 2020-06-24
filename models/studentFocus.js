const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const studentFocusSchema = new mongoose.Schema({
	tags        : [
		String,
	],
	created     : {
		type    : Date,
		default : Date.now,
	},	
	author      : {
		type     : mongoose.Schema.ObjectId,
		ref      : 'User',
		required : 'You must supply an author',
	},
	comments: {
		type: String
	}
});

// Define our indexes
storeSchema.index({
	name        : 'text',
	description : 'text',
});


storeSchema.statics.getTagsList = function() {
	return this.aggregate([
		{ $unwind: '$tags' },
		{ $group: { _id: '$tags', count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
	]);
};

module.exports = mongoose.model('studentFocus', studentFocusSchema);
