exports.up = (pgm) => {
  pgm.createTable('organizations', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(50)', notNull: true },
    comment: { type: 'varchar(250)', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('organizations')
}
