const express = require('express');

const router = express.Router();

const userController = require('../Controllers/userController');

router.post('/user/signup', userController.createNewUser);

router.post('/user/login', userController.postLogin);

module.exports = router;