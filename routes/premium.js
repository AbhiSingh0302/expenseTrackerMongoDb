const express = require('express');

const PremiumController = require('../controller/premium');

const premiumMiddleware = require('../middleware/auth');

const router = express.Router();

// router.get('/get-premium',premiumMiddleware.authorization,PremiumController.getPremium);

// router.post('/get-premium/payment',PremiumController.updatePayment);

// router.get('/premium/show-leaderboard',premiumMiddleware.authorization,PremiumController.showLeaderboard);

// router.get('/premium/getexpense',PremiumController.getExpense);

// router.get('/premium/showPage',PremiumController.showPage);

module.exports = router;