const { Router } = require('express')
const router = Router()
const pool = require('../db.js')
const createWorkersController = require('../controllers/workers.js')

const workersController = createWorkersController(pool)

router.post('/', workersController.createWorker)
router.get('/', workersController.getWorkers)
router.get('/:id', workersController.getWorkerById)
router.put('/:id', workersController.updateWorker)
router.delete('/:id', workersController.deleteWorker)

module.exports = router
