const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const disciplineSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply a teacher!",
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply a student!",
  },
  teacherComments: {
    type: String,
  },
  class: String,
  description: {
    type: String,
  },
  location: [String],
  studentConductTeacher: [String],
  studentConductAdmin: [String],
  teacherActions: [String],
  others: [String],
  adminFollowUp: String,
});

function autopopulate(next) {
  this.populate("teacher");
  this.populate("student");
  next();
}

disciplineSchema.pre("find", autopopulate);
disciplineSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("Discipline", disciplineSchema);
