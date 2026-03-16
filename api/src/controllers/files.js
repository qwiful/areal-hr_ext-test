const Joi = require('joi')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
})

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

const createController = (pool) => ({
  uploadFile: [
    upload.single('file'),
    async (req, res, next) => {
      if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' })
      }

      const { name, id_worker } = req.body
      if (!name || !id_worker) {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({ error: 'Поля name и id_worker обязательны' })
      }

      const workerId = Number(id_worker)
      if (!Number.isInteger(workerId) || workerId <= 0) {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({ error: 'id_worker должен быть положительным числом' })
      }

      try {
        const workerCheck = await pool.query(
          'SELECT id FROM workers WHERE id = $1 AND delete_at IS NULL',
          [workerId],
        )
        if (workerCheck.rows.length === 0) {
          fs.unlinkSync(req.file.path)
          return res.status(400).json({ error: 'Сотрудник не найден' })
        }

        const result = await pool.query(
          `INSERT INTO files (name, file, id_worker)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [name, req.file.filename, workerId],
        )

        res.status(201).json(result.rows[0])
      } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path)
        }
        next(err)
      }
    },
  ],

  getFiles: async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT f.*, w.surname || ' ' || w.name AS worker_name
        FROM files f
        LEFT JOIN workers w ON f.id_worker = w.id
        WHERE f.delete_at IS NULL
        ORDER BY f.id
      `)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  getFileById: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query('SELECT * FROM files WHERE id = $1 AND delete_at IS NULL', [
        id,
      ])
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Файл не найден' })
      }
      res.json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  downloadFile: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query('SELECT * FROM files WHERE id = $1 AND delete_at IS NULL', [
        id,
      ])
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Файл не найден' })
      }

      const filePath = path.join(UPLOADS_DIR, result.rows[0].file)
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Файл не найден на диске' })
      }

      res.download(filePath, result.rows[0].name)
    } catch (err) {
      next(err)
    }
  },

  deleteFile: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        'UPDATE files SET delete_at = CURRENT_TIMESTAMP WHERE id = $1 AND delete_at IS NULL RETURNING *',
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Файл не найден' })
      }

      res.json({ message: 'Файл помечен как удалённый' })
    } catch (err) {
      next(err)
    }
  },
})

module.exports = createController
