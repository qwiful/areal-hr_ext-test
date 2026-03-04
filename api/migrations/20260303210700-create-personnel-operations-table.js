exports.up = (pgm) => {
  pgm.createTable('personnel_operations', {
    id: { type: 'serial', primaryKey: true },
    id_worker: { type: 'integer', notNull: true },
    operation_type: { type: 'varchar(100)', notNull: true },
    id_department: { type: 'integer' },
    id_position: { type: 'integer' },
    salary: { type: 'numeric(12,2)' },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
  pgm.addConstraint('personnel_operations', 'fk_department', {
    foreignKeys: {
      columns: 'id_department',
      references: 'departments(id)',
      onDelete: 'CASCADE',
    },
  })
  pgm.addConstraint('personnel_operations', 'fk_position', {
    foreignKeys: {
      columns: 'id_position',
      references: 'positions(id)',
      onDelete: 'CASCADE',
    },
  })
  pgm.addConstraint('personnel_operations', 'fk_worker', {
    foreignKeys: {
      columns: 'id_worker',
      references: 'workers(id)',
      onDelete: 'CASCADE',
    },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('personnel_operations')
}
