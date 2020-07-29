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
  child: mongoose.Schema.ObjectId,
  currentAssignment: String,
  ta: mongoose.Schema.ObjectId,
  math: mongoose.Schema.ObjectId,
  languageArts: mongoose.Schema.ObjectId,
  science: mongoose.Schema.ObjectId,
  socialStudies: mongoose.Schema.ObjectId,
  trimester1: mongoose.Schema.ObjectId,
  trimester2: mongoose.Schema.ObjectId,
  trimester3: mongoose.Schema.ObjectId,
  callbackCount: String,
});

function autopopulate(next) {
  this.populate("ta");
  this.populate("math");
  this.populate("languageArts");
  this.populate("science");
  this.populate("socialStudies");
  this.populate("trimester1");
  this.populate("trimester2");
  this.populate("trimester3");
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
