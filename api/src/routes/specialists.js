const { Router } = require('express')
const router = Router()
const pool = require('../db.js')
const createSpecialistsController = require('../controllers/specialists.js')

const specialistsController = createSpecialistsController(pool)

router.post('/', specialistsController.createSpecialist)
router.get('/', specialistsController.getSpecialists)
router.get('/roles', specialistsController.getRoles)
router.get('/:id', specialistsController.getSpecialistById)
router.put('/:id', specialistsController.updateSpecialist)
router.delete('/:id', specialistsController.deleteSpecialist)

module.exports = router
