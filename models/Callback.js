const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const callbackSchema = new mongoose.Schema({
  assigned: {
    type: Date,
    default: Date.now
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply a teacher!'
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply a student!'
  },
  assignment: {
    type: String,
    required: 'You must have an assignment!'
  },
  description: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
  },
  linkTitle: {
    type: String,
  },
});

function autopopulate(next) {
  this.populate('teacher');
  this.populate('student');
  next();
}

callbackSchema.pre('find', autopopulate);
callbackSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Callback', callbackSchema);
