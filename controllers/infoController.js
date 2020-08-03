const mongoose = require("mongoose");
const Info = mongoose.model("Info");
const User = mongoose.model("User");

exports.addInfo = (req, res) => {
  res.render("editInfo", { title: "Add Important Info" });
};

exports.getInfo = async (req, res) => {
  let infos = {};
  if (req.user) {
    // check if teacher for calendar events
    if (req.user.isTeacher || req.user.isAdmin) {
      infos = await Info.find().sort({ category: 1 });
    } else {
      infos = await Info.find({
        teachersOnly: "",
      }).sort({ category: 1 });
    }
  } else {
    infos = await Info.find({
      teachersOnly: "",
    }).sort({ category: 1 });
  }
  res.render("infos", { title: "Important Links & Documents", infos: infos });
};

exports.createInfo = async (req, res) => {
  req.body.author = req.user.id;
  const info = await new Info(req.body).save();
  req.flash("success", `Successfully Created ${info.title}.`);
  res.redirect(`/info`);
};

exports.updateInfo = async (req, res) => {
  // find and update store
  const info = await Info.findOneAndUpdate({ _id: req.params._id }, req.body, {
    new: true,
    runValidators: true,
  }).exec();
  // redirect to the store and tell them it worked
  req.flash("success", `Sucessfully Updated <strong>${info.title}</strong>.`);
  res.redirect(`/info`);
};

exports.editInfo = async (req, res) => {
  //find the event given id
  const info = await Info.findOne({ _id: req.params._id });

  //confirm they are owner of the event or admin
  if (!req.user.isAdmin) {
    confirmOwner(info, req.user);
  }

  //render out the edit form so they can edit
  res.render("editInfo", { title: `edit ${info.title}`, info });
};
