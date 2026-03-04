exports.up = (pgm) => {
  pgm.createTable('history_changes', {
    id: { type: 'serial', primaryKey: true },
    who_changed: { type: 'integer', notNull: true },
    object: { type: 'varchar(100)', notNull: true },
    changed_field: { type: 'json', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
  })
  pgm.addConstraint('history_changes', 'fk_specialist', {
    foreignKeys: {
      columns: 'who_changed',
      references: 'specialist(id)',
      onDelete: 'CASCADE',
    },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('history_changes')
}
