const { Router } = require('express')
const router = Router()
const pool = require('../db.js')
const createOrganizationsController = require('../controllers/organizations.js')

const organizationsController = createOrganizationsController(pool)

router.post('/', organizationsController.createOrganization)
router.get('/', organizationsController.getOrganizations)
router.get('/:id', organizationsController.getOrganizationById)
router.put('/:id', organizationsController.updateOrganization)
router.delete('/:id', organizationsController.deleteOrganization)

module.exports = router
