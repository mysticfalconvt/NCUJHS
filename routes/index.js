const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const callbackController = require("../controllers/callbackController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const infoController = require("../controllers/infoController");
const studentFocusController = require("../controllers/studentFocusController");
const mailController = require("../controllers/mailController");
const taController = require("../controllers/taController");
const pbisController = require("../controllers/pbisController");
const disciplineController = require("../controllers/disciplineController");
const { catchErrors } = require("../handlers/errorHandlers");

// Do work here

//home route
router.get("/", catchErrors(calendarController.dashboard));

// Calendar Routes
router.get("/add", authController.isLoggedIn, calendarController.addEvent);
router.get("/calendars", catchErrors(calendarController.getEvents));
router.get("/allCalendars", catchErrors(calendarController.getAllEvents));
router.post("/add", catchErrors(calendarController.createEvent));
router.post("/add/:_id", catchErrors(calendarController.updateEvent));
router.get("/calendar/:_id/edit", catchErrors(calendarController.editEvent));
router.get("/calendar/:_id", catchErrors(calendarController.getEventByID));

// Callback Routes
router.get(
  "/callback/add",
  authController.isLoggedIn,
  callbackController.addCallback,
);
router.post(
  "/callback/add",
  authController.isLoggedIn,
  catchErrors(callbackController.createCallback),
);
router.post(
  "/callback/add/:_id",
  authController.isLoggedIn,
  catchErrors(callbackController.updateCallback),
);
router.get(
  "/callback/teacher/old",
  catchErrors(callbackController.getallCallbackByTeacher),
);
router.get(
  "/callback/teacher",
  catchErrors(callbackController.getCallbackByTeacher),
);
router.get(
  "/callback/student",
  catchErrors(callbackController.getCallbackByStudent),
);
router.get("/callback/:_id/edit", catchErrors(callbackController.editCallback));
router.get(
  "/callback/:_id/duplicate",
  catchErrors(callbackController.duplicateCallback),
);
router.get("/callback/:_id", catchErrors(callbackController.getCallbackByID));

//Account Routes
router.get("/login", userController.loginForm);
router.post("/login", authController.login);
router.get(
  "/register",
  authController.isLoggedIn,
  authController.isTeacher,
  userController.registerForm,
);
router.get(
  "/parent/register/:_id",
  catchErrors(userController.registerParentForm),
);
router.post(
  "/register",
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login,
);
router.get("/logout", authController.logout);
router.get("/account", authController.isLoggedIn, userController.account);
router.get(
  "/user/search/:category",
  authController.isLoggedIn,
  catchErrors(userController.searchUser),
);
router.get(
  "/teacher/search/:category",
  authController.isLoggedIn,
  catchErrors(userController.searchTeachers),
);
router.get(
  "/user/edit/:_id",
  authController.isLoggedIn,
  userController.editAccount,
);
router.post(
  "/user/edit/:_id",
  authController.isLoggedIn,
  catchErrors(userController.adminUpdateAccount),
);
router.post(
  "/user/currentWork/:_id",
  authController.isLoggedIn,
  catchErrors(userController.updateCurrentWork),
);
router.get(
  "/user/:_id",
  authController.isLoggedIn,
  authController.isTeacher,
  userController.userSearchResult,
);
router.post("/account", catchErrors(userController.updateAccount));
router.post("/account/forgot", catchErrors(authController.forgot));
router.get("/account/reset/:_id", catchErrors(authController.reset));
router.post(
  "/account/reset/:_id",
  authController.confirmedPasswords,
  catchErrors(authController.update),
);

// PBIS routes
router.get(
  "/pbis/add",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.addPbis),
);
router.get(
  "/pbis/weekly",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.getWeeklyPbis),
);
router.get(
  "/pbis/resetCounts",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.weeklyPbisCheckIn),
);
router.post(
  "/pbis/add",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.createPbis),
);
router.get(
  "/pbis/search/:category",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.getPbis),
);
router.get(
  "/pbis/ta/:_id",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.taPbis),
);
router.post(
  "/pbis/student/:_id",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.bulkPbisCard),
);

router.get(
  "/pbis/add/student/:_id/:category",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.quickCard),
);

// PBIS Team Routes
router.get(
  "/pbis/team/add",
  authController.isLoggedIn,
  authController.isTeacher,
  pbisController.addPbisTeam,
);
router.get(
  "/pbis/teamList",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.taTeamList),
);
router.get(
  "/pbis/team/:_id",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.editPbisTeam),
);
router.post(
  "/pbis/team/add",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.createPbisTeam),
);
router.post(
  "/pbis/team/:_id",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(pbisController.updatePbisTeam),
);

// info routes
router.get("/info/search/:category", catchErrors(infoController.getInfo));
router.get("/info", catchErrors(infoController.getInfo));
router.get("/info/add", authController.isLoggedIn, infoController.addInfo);
router.post(
  "/info/add",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(infoController.createInfo),
);
router.post(
  "/info/add/:_id",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(infoController.updateInfo),
);
router.get(
  "/info/:_id",
  authController.isLoggedIn,
  catchErrors(infoController.editInfo),
);
// studentFocus routes
router.get(
  "/studentFocus/search/:category",
  authController.isTeacher,
  catchErrors(studentFocusController.getStudentFocus),
);
router.get(
  "/studentFocus/search/:category/:_id",
  authController.isTeacher,
  catchErrors(studentFocusController.getOneStudentFocus),
);
router.get(
  "/studentFocus/add",
  authController.isLoggedIn,
  studentFocusController.addStudentFocus,
);
router.post(
  "/studentFocus/add",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(studentFocusController.createStudentFocus),
);
router.post(
  "/studentFocus/add/:_id",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(studentFocusController.updateStudentFocus),
);
router.get(
  "/studentFocus/:_id",
  authController.isLoggedIn,
  catchErrors(studentFocusController.editStudentFocus),
);

// ta routes

router.get(
  "/ta",
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(taController.taDashboard),
);

//Mail Routes
router.get(
  `/email/parent/:_id`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(mailController.parentSignup),
);
router.post(
  `/email/parent/:_id`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(mailController.sendParentSignup),
);
router.get(
  `/email/callbackCount/:_id`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(mailController.sendParentCallbackCount),
);

/* 
	Discipline 
*/

router.get(
  `/discipline/addNew`,
  authController.isLoggedIn,
  authController.isTeacher,
  disciplineController.addDiscipline,
);
router.post(
  `/discipline/add`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(disciplineController.createDiscipline),
);
router.get(
  `/bullying/addNew`,
  authController.isLoggedIn,
  authController.isTeacher,
  disciplineController.addBullying,
);
router.post(
  `/bullying/add`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(disciplineController.createBullying),
);
router.get(
  `/discipline/list`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(disciplineController.viewDisciplineList),
);
router.get(
  `/bullying/list`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(disciplineController.viewBullyingList),
);
router.get(
  `/discipline/:_id`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(disciplineController.viewDiscipline),
);
router.get(
  `/discipline/print/:_id`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(disciplineController.viewDisciplinePrintable),
);
router.post(
  `/discipline/edit/:_id`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(disciplineController.updateDiscipline),
);
router.post(
  `/bullying/edit/:_id`,
  authController.isLoggedIn,
  authController.isTeacher,
  catchErrors(disciplineController.updateBullying),
);

/* 
	API
*/

router.get("/api/searchUser", catchErrors(userController.searchAll));
router.get(
  "/api/searchStudent",
  authController.isLoggedIn,
  catchErrors(userController.searchStudent),
);
router.get("/api/searchTeacher", catchErrors(userController.searchTeacher));
router.get("/api/searchInfos", catchErrors(infoController.searchInfos));

module.exports = router;
