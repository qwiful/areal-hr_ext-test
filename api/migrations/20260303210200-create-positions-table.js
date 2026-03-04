exports.up = (pgm) => {
  pgm.createTable('positions', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('positions')
}
