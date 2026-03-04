exports.up = (pgm) => {
  pgm.createTable('address', {
    id: { type: 'serial', primaryKey: true },
    region: { type: 'varchar(100)', notNull: true },
    locality: { type: 'varchar(100)', notNull: true },
    street: { type: 'varchar(100)', notNull: true },
    house: { type: 'varchar(100)', notNull: true },
    building: { type: 'varchar(100)', notNull: true },
    apartment: { type: 'varchar(10)', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('address')
}
