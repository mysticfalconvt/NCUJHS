const mongoose = require("mongoose");
const User = mongoose.model("User");
const Callback = mongoose.model("Callback");
const promisify = require("es6-promisify");
const { TRUE } = require("node-sass");

updateCheck = (body) => {
  
  if(body.ta) {
    return  {
    name: body.name,
    email: body.email,
    ta: body.ta,
    isTeacher: body.isTeacher,
    isAdmin: body.isAdmin,
    }} else  {
      return   {
      name: body.name,
      email: body.email,
      isTeacher: body.isTeacher,
      isAdmin: body.isAdmin,
      };
    };
      
}

exports.loginForm = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};
exports.searchUser = (req, res) => {
  res.render("searchUser", { title: "Search for an account" });
};

exports.userSearchResult = async (req, res) => {
  // find the account
  const account = await User.findOne({ _id: req.params._id });
  // find their callback
  const callbacks = await Callback.find({ student: req.params._id });
  // find their callback
  const ta = await User.find({ ta: req.params._id });
  //render out the edit form so they can edit
  res.render("userSearchResult", {
    title: `${account.name}'s details`,
    account,
    callbacks,
    ta,
  });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("email", "That Email is not valid!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody("password", "Password Cannot be Blank!").notEmpty();
  req
    .checkBody("password-confirm", "Confirmed Password cannot be blank!")
    .notEmpty();
  req
    .checkBody("password-confirm", "Oops! Your passwords do not match")
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash(
      "error",
      errors.map((err) => err.msg),
    );
    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash(),
    });
    return; // stop the fn from running
  }
  next(); // there were no errors!
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next(); // pass to authController.login
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit your account" });
};

exports.editAccount = async (req, res) => {
  // find the account
  const account = await User.findOne({ _id: req.params._id });
  res.render("accountAdmin", { title: "Edit account", account });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: "query" },
  );
  req.flash("success", "Updated the profile!");
  res.redirect("back");
};
exports.adminUpdateAccount = async (req, res) => {
  console.log(req.body.ta);
  const updates = updateCheck(req.body);
  console.log(updates);
  const user = await User.findOneAndUpdate(
    { _id: req.body.id },
    { $set: updates },
    { new: true, runValidators: true, context: "query" },
  );
  req.flash("success", req.body.ta);
  res.redirect("back");
};

//API
exports.searchTeacher = async (req, res) => {
  const users = await User.find(
    {
      $text: {
        $search: req.query.q,
      },
      isTeacher: "true",
    },
    {
      score: { $meta: "textScore" },
    },
  )
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(10);
  res.json(users);
};
exports.searchStudent = async (req, res) => {
  const users = await User.find(
    {
      $text: {
        $search: req.query.q,
      },
      isTeacher: "",
      isAdmin: "",
    },
    {
      score: { $meta: "textScore" },
    },
  )
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(10);
  res.json(users);
};

exports.searchAll = async (req, res) => {
  const users = await User.find(
    {
      $text: {
        $search: req.query.q,
      },
    },
    {
      score: { $meta: "textScore" },
    },
  )
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(10);
  res.json(users);
};
