import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  createExpense,
  getAllExpenses,
  getExpensesSummary,
  updateExpense,
  deleteExpense
} from '../controllers/expensesController.js'

const router = express.Router()
import { tenantContext } from '../middleware/tenantContext.js'

// All routes require authentication and tenant context
// CRITICAL: tenantContext middleware ensures data isolation between businesses
router.use(authenticate)
router.use(tenantContext)

// Create new expense
router.post('/', createExpense)

// Get all expenses with pagination
router.get('/', getAllExpenses)

// Get expenses summary
router.get('/summary', getExpensesSummary)

// Update expense
router.put('/:id', updateExpense)

// Delete expense
router.delete('/:id', deleteExpense)

export default router
