const express = require('express');

const router = express.Router();

const authMiddleware = require('../Middleware/auth');

const expenseController = require('../Controllers/expenseController');

router.get('/admin/expenses', authMiddleware.authenticateToken, expenseController.getAllExpenses);

router.get('/admin/getExpenseById/:id', authMiddleware.authenticateToken, expenseController.getExpenseById);

router.post('/admin/add-expense', authMiddleware.authenticateToken, expenseController.addNewExpense);

router.put('/admin/update-expense/:id', authMiddleware.authenticateToken, expenseController.updateExpense);

router.delete('/admin/delete-expense/:id', authMiddleware.authenticateToken ,expenseController.deleteExpense);

module.exports = router;