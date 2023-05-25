const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.patch('/verify-email/:token', userController.verifyEmail);
router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.post('/google-login', userController.loginWithGoogle);
module.exports = router;
