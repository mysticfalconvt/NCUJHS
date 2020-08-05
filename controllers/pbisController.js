const mongoose = require("mongoose");
const Pbis = mongoose.model("Pbis");
const User = mongoose.model("User");

exports.addPbis = (req, res) => {
  res.render("pbisForm", { title: "Add PBIS" });
};

exports.getInfo = async (req, res) => {
  const category = req.params.category || "category";
  let sort = {};
  sort[category] = 1;
  let infos = {};
  if (req.user) {
    // check if teacher for calendar events
    if (req.user.isTeacher || req.user.isAdmin || req.user.isPara) {
      infos = await Info.find().sort(sort);
    } else {
      infos = await Info.find({
        teachersOnly: "",
      }).sort(sort);
    }
  } else {
    infos = await Info.find({
      teachersOnly: "",
    }).sort({ category: 1 });
  }
  res.render("infos", { title: "Important Links & Documents", infos: infos });
};

exports.createPbis = async (req, res) => {
  req.body.teacher = req.user.id;
  const pbis = await new Pbis(req.body).save();
  req.flash("success", `Successfully Created !!`);
  res.redirect(`/`);
};

exports.updateInfo = async (req, res) => {
  // find and update store
  const info = await Info.findOneAndUpdate({ _id: req.params._id }, req.body, {
    new: true,
    runValidators: true,
  }).exec();
  // redirect to the store and tell them it worked
  req.flash("success", `Sucessfully Updated <strong>${info.title}</strong>.`);
  res.redirect(`/info/search/category`);
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
