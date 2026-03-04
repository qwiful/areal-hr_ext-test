exports.up = (pgm) => {
  pgm.createTable('specialist', {
    id: { type: 'serial', primaryKey: true },
    surname: { type: 'varchar(50)', notNull: true },
    name: { type: 'varchar(50)', notNull: true },
    patronymic: { type: 'varchar(50)' },
    id_authorization: { type: 'integer', notNull: true },
    id_role: { type: 'integer', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
  pgm.addConstraint('specialist', 'fk_authorization', {
    foreignKeys: {
      columns: 'id_authorization',
      references: '"authorization"(id)',
      onDelete: 'CASCADE',
    },
  })
  pgm.addConstraint('specialist', 'fk_role', {
    foreignKeys: {
      columns: 'id_role',
      references: 'role(id)',
      onDelete: 'CASCADE',
    },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('specialist')
}
