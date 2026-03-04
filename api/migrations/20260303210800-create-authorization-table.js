exports.up = (pgm) => {
  pgm.createTable('authorization', {
    id: { type: 'serial', primaryKey: true },
    login: { type: 'varchar(20)', notNull: true },
    password: { type: 'varchar(255)', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('authorization')
}
