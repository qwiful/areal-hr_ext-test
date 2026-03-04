exports.up = (pgm) => {
  pgm.createTable('role', {
    id: { type: 'serial', primaryKey: true },
    role: { type: 'varchar(20)', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('role')
}
