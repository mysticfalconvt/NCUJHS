const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(calendarController.getTodaysEvents));
router.get('/calendars', catchErrors(calendarController.getEvents));
router.get('/add', authController.isLoggedIn, calendarController.addEvent);

router.post(
	'/add',
	catchErrors(calendarController.createEvent),
);

router.post(
	'/add/:_id',
	
	catchErrors(calendarController.updateEvent),
);

router.get('/calendar/:_id/edit', catchErrors(calendarController.editEvent));

router.get('/calendar/:_id', catchErrors(calendarController.getEventByID));



router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

router.post('/register', userController.validateRegister, userController.register, authController.login);
router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', authController.confirmedPasswords, catchErrors(authController.update));


/* 
	API
*/

router.get('/api/search', catchErrors(calendarController.searchEvent));


module.exports = router;
