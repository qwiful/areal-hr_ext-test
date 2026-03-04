exports.up = (pgm) => {
  pgm.createTable('files', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    file: { type: 'varchar(100)', notNull: true },
    id_worker: { type: 'integer', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
  pgm.addConstraint('files', 'fk_worker', {
    foreignKeys: {
      columns: 'id_worker',
      references: 'workers(id)',
      onDelete: 'CASCADE',
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('files')
}
