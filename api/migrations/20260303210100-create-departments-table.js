exports.up = (pgm) => {
  pgm.createTable('departments', {
    id: { type: 'serial', primaryKey: true },
    id_organization: { type: 'integer', notNull: true },
    name: { type: 'varchar(50)', notNull: true },
    id_parent: { type: 'integer' },
    comment: { type: 'varchar(250)', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
  pgm.addConstraint('departments', 'fk_organization', {
    foreignKeys: {
      columns: 'id_organization',
      references: 'organizations(id)',
      onDelete: 'CASCADE',
    },
  })
  pgm.addConstraint('departments', 'fk_parent', {
    foreignKeys: {
      columns: 'id_parent',
      references: 'departments(id)',
      onDelete: 'CASCADE',
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('departments')
}
