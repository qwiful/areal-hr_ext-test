const { Router } = require('express')
const router = Router()
const pool = require('../db.js')
const createFilesController = require('../controllers/files.js')

const filesController = createFilesController(pool)

router.post('/', filesController.uploadFile)
router.get('/', filesController.getFiles)
router.get('/:id', filesController.getFileById)
router.get('/:id/download', filesController.downloadFile)
router.delete('/:id', filesController.deleteFile)

module.exports = router
