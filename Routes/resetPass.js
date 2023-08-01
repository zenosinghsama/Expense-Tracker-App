const express = require('express');

const resetPassController = require('../Controllers/forgotPassword');

const router = express.Router();

router.get('/updatepassword/:resetpasswordid', resetPassController.updatePassword)

router.get('/resetpassword/:id', resetPassController.resetpassword);

router.use('/forgotpassword', resetPassController.forgotPassword)

module.exports = router;