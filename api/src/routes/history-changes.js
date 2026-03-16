const { Router } = require('express')
const router = Router()
const pool = require('../db.js')
const createHistoryController = require('../controllers/history-changes.js')

const historyController = createHistoryController(pool)

router.get('/', historyController.getHistory)
router.get('/:id', historyController.getHistoryById)

module.exports = router
