const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require("md5");
const validator = require("validator");
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"],
    required: "Please Supply an email address",
  },
  name: {
    type: String,
    required: "Please supply a name",
    trim: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isTeacher: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: String,
    default: "",
  },
  isParent: {
    type: String,
    default: "",
  },
  isPara: {
    type: String,
    default: "",
  },
  isPbis: {
    type: String,
    default: "",
  },
  child: mongoose.Schema.ObjectId,
  parent: { type: [mongoose.Schema.ObjectId], default: [] },
  currentAssignment: String,
  ta: mongoose.Schema.ObjectId,
  math: mongoose.Schema.ObjectId,
  languageArts: mongoose.Schema.ObjectId,
  science: mongoose.Schema.ObjectId,
  socialStudies: mongoose.Schema.ObjectId,
  trimester1: mongoose.Schema.ObjectId,
  trimester2: mongoose.Schema.ObjectId,
  trimester3: mongoose.Schema.ObjectId,
  callbackCount: {
    type: Number,
    default: 0,
  },
  cellPhoneCount: {
    type: Number,
    default: 0,
  },
  pbisCount: {
    type: Number,
    default: 0,
  },
  taPbisCount: {
    type: Number,
    default: 0,
  },
  yearPbisCount: {
    type: Number,
    default: 0,
  },
  bullyingRole: {
    type: String,
  },
  block1: mongoose.Schema.ObjectId,
  block2: mongoose.Schema.ObjectId,
  block3: mongoose.Schema.ObjectId,
  block4: mongoose.Schema.ObjectId,
  block5: mongoose.Schema.ObjectId,
  block6: mongoose.Schema.ObjectId,
  block7: mongoose.Schema.ObjectId,
  block8: mongoose.Schema.ObjectId,
  block9: mongoose.Schema.ObjectId,
  teacherSubject: String,
  previousPbisWinner: mongoose.Schema.ObjectId,
});

function autopopulate(next) {
  this.populate("ta");
  this.populate("child");
  this.populate("block1");
  this.populate("block2");
  this.populate("block3");
  this.populate("block4");
  this.populate("block5");
  this.populate("block6");
  this.populate("block7");
  this.populate("block8");
  this.populate("block9");
  next();
}

userSchema.pre("find", autopopulate);
userSchema.pre("findOne", autopopulate);

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
userSchema.plugin(mongodbErrorHandler);

userSchema.index({
  name: "text",
});

module.exports = mongoose.model("User", userSchema);
