const { Router } = require('express')
const router = Router()
const pool = require('../db')
const createSpecialistsController = require('../controllers/specialists')

const specialistsController = createSpecialistsController(pool)

router.get('/', specialistsController.getSpecialists)
router.get('/roles', specialistsController.getRoles)
router.get('/:id', specialistsController.getSpecialistById)
router.post('/', specialistsController.createSpecialist)
router.put('/:id', specialistsController.updateSpecialist)
router.delete('/:id', specialistsController.deleteSpecialist)

module.exports = router
