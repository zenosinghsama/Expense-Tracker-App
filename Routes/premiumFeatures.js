const express = require('express');

const router = express.Router();

const authMiddleware = require('../Middleware/auth');

const premiumController = require('../Controllers/premiumController');

router.get('/showLeaderBoard', authMiddleware.authenticateToken, premiumController.getLeaderBoard);

router.get('/downloadReport', authMiddleware.authenticateToken, premiumController.getExpenseReport);

router.get('/showPrevDownloads', authMiddleware.authenticateToken, premiumController.showUserDownloads);

module.exports = router;