exports.up = (pgm) => {
  pgm.createTable('workers', {
    id: { type: 'serial', primaryKey: true },
    surname: { type: 'varchar(50)', notNull: true },
    name: { type: 'varchar(50)', notNull: true },
    patronymic: { type: 'varchar(50)' },
    date_of_birth: { type: 'date', notNull: true },
    id_passport: { type: 'integer', notNull: true },
    id_address: { type: 'integer', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
  pgm.addConstraint('workers', 'fk_passport', {
    foreignKeys: {
      columns: 'id_passport',
      references: 'passports(id)',
      onDelete: 'CASCADE',
    },
  })
  pgm.addConstraint('workers', 'fk_address', {
    foreignKeys: {
      columns: 'id_address',
      references: 'address(id)',
      onDelete: 'CASCADE',
    },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('workers')
}
