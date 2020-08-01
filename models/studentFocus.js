const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const studentFocusSchema = new mongoose.Schema({
	
	created     : {
		type    : Date,
		default : Date.now,
	},	
	teacher      : {
		type     : mongoose.Schema.ObjectId,
		ref      : 'User',
		required : 'You must supply a teacher',
	},
	student      : {
		type     : mongoose.Schema.ObjectId,
		ref      : 'User',
		required : 'You must supply a student',
	},
	comments: {
		type: String
	},
	category: {
		type: String
	},
});

function autopopulate(next) {
	this.populate("teacher");
	this.populate("student");
	next();
  }
  
  studentFocusSchema.pre("find", autopopulate);
  studentFocusSchema.pre("findOne", autopopulate);




module.exports = mongoose.model('studentFocus', studentFocusSchema);
