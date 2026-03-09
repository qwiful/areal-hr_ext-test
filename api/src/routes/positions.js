const { Router } = require('express')
const router = Router()
const pool = require('../db.js')
const createPositionsController = require('../controllers/positions.js')

const positionsController = createPositionsController(pool)

router.post('/', positionsController.createPosition)
router.get('/', positionsController.getPositions)
router.get('/:id', positionsController.getPositionById)
router.put('/:id', positionsController.updatePosition)
router.delete('/:id', positionsController.deletePosition)

module.exports = router
