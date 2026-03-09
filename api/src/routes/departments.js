const { Router } = require('express')
const router = Router()
const pool = require('../db.js')
const createDepartmentsController = require('../controllers/departments.js')

const departmentsController = createDepartmentsController(pool)

router.post('/', departmentsController.createDepartment)
router.get('/', departmentsController.getDepartments)
router.get('/:id', departmentsController.getDepartmentById)
router.put('/:id', departmentsController.updateDepartment)
router.delete('/:id', departmentsController.deleteDepartment)

module.exports = router
