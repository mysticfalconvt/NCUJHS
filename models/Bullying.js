const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const bullyingSchema = new mongoose.Schema({
  dateReported: {
    type: Date,
    default: Date.now,
  },
  investigationDate: {
    type: Date,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply a teacher!",
  },
  offender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply a student!",
  },
  witnessed: String,
  studentReporter: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  incidentDate: Date,
  incidentTime: String,

  description: {
    type: String,
  },
  studentWitness: String,
  employeeWitness: String,
  studentsInterviewed: String,
  initialActions: String,
  nextSteps: String,
  reporter: String,
  determinationYN: String,
  determinationExplination: String,
  determinationDate: Date,
  assignmentInvestigator: String,
});

function autopopulate(next) {
  this.populate("author");
  this.populate("offender");
  next();
}

bullyingSchema.pre("find", autopopulate);
bullyingSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("Bullying", bullyingSchema);
