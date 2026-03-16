const { Router } = require('express')
const router = Router()
const pool = require('../db.js')
const createOperationsController = require('../controllers/personnel-operations.js')

const operationsController = createOperationsController(pool)

router.post('/', operationsController.createOperation)
router.get('/', operationsController.getOperations)
router.get('/:id', operationsController.getOperationById)
router.put('/:id', operationsController.updateOperation)
router.delete('/:id', operationsController.deleteOperation)

module.exports = router
