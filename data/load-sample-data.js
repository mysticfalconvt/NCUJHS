require("dotenv").config({ path: __dirname + "/../variables.env" });
const fs = require("fs");

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

// import all of our models - they need to be imported only once
// const Store = require('../models/Store');
// const Review = require('../models/Review');
const User = require("../models/User");
const Calendar = require("../models/Calendar");
const Pbis = require("../models/Pbis");
const PbisTeam = require("../models/PbisTeam");

const { updatePbisCounts } = require("../controllers/pbisController");
// const stores = JSON.parse(fs.readFileSync(__dirname + '/stores.json', 'utf-8'));
// const reviews = JSON.parse(fs.readFileSync(__dirname + '/reviews.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync(__dirname + "/users.json", "utf-8"));
const pbis = JSON.parse(fs.readFileSync(__dirname + "/pbis.json", "utf-8"));
// const calendars = JSON.parse(
//   fs.readFileSync(__dirname + "/calendar.json", "utf-8"),
// );

async function deleteData() {
  console.log("😢😢 Goodbye Data...");
  await Store.remove();
  // await Review.remove();
  await User.remove();
  console.log(
    "Data Deleted. To load sample data, run\n\n\t npm run sample\n\n",
  );
  process.exit();
}

async function loadData() {
  try {
    // await Store.insertMany(stores);
    // await Review.insertMany(reviews);
    // await User.insertMany(users);
    // await Calendar.insertMany(calendars);
    console.log("👍👍👍👍👍👍👍👍 Done!");
    process.exit();
  } catch (e) {
    console.log(
      "\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n",
    );
    console.log(e);
    process.exit();
  }
}
async function updateData() {
  try {
    for (const user of users) {
      console.log(user.email);
      const updateData = {
        block1: user.block1,
        block2: user.block2,
        block3: user.block3,
        block4: user.block4,
        ta: user.ta,
      };
      userUpdate = await User.findOneAndUpdate(
        { email: user.email },
        updateData,
      );
      console.log(userUpdate.name);
    }

    console.log("👍👍👍👍👍👍👍👍 Done!");
    process.exit();
  } catch (e) {
    console.log("\n👎👎👎👎👎👎👎👎 Error! The Error info is below");
    console.log(e);
    process.exit();
  }
}
if (process.argv.includes("--delete")) {
  deleteData();
} else if (process.argv.includes("--update")) {
  updateData();
} else if (process.argv.includes("--pbis")) {
  givePbisCards();
} else {
  loadData();
}

async function givePbisCards() {
  try {
    for (const email of pbis) {
      console.log(email.email);
      const student = await User.findOne({ email: email.email });

      for (var i = 0; i < 5; i++) {
        console.log(student.email);
        console.log(i);
        const card = {
          student: student._id,
          teacher: "5f04b1a7b1cc70187c60bed2",
          category: "Bonus Card",
          message: "Great Job on our first remote day!!",
        };
        const pbis = await new Pbis(card).save();
      }
      updatePbisCounts(student._id);
    }

    console.log("👍👍👍👍👍👍👍👍 Done!");
    process.exit();
  } catch (e) {
    console.log("\n👎👎👎👎👎👎👎👎 Error! The Error info is below");
    console.log(e);
    process.exit();
  }
}
