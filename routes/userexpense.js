const express = require('express');

const path = require('path');

const expenseMiddleware = require('../middleware/auth');

const expenseController = require('../controller/expense');

const router = express.Router();

router.get('/expense/user/:id',expenseMiddleware.authorization,expenseController.expenseDelete);

router.get('/expense/all',expenseMiddleware.authorization,expenseController.expenseAll);

router.post('/expense/create',expenseMiddleware.authorization,expenseController.expenseCreate);

router.get('/expense',expenseController.expensePage);

// router.get('/download',expenseMiddleware.authorization,expenseController.download);

router.get('/expense/pagination/:page',expenseMiddleware.authorization,expenseController.pagination);

module.exports = router;