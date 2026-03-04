exports.up = (pgm) => {
  pgm.createTable('passports', {
    id: { type: 'serial', primaryKey: true },
    series: { type: 'varchar(20)', notNull: true },
    number: { type: 'varchar(20)', notNull: true },
    date_issue: { type: 'date', notNull: true },
    unit_kod: { type: 'varchar(20)', notNull: true },
    issued_by_whom: { type: 'varchar(250)', notNull: true },
    add_at: { type: 'timestamp', default: pgm.func('NOW()') },
    update_at: { type: 'timestamp', default: pgm.func('NOW()') },
    delete_at: { type: 'timestamp' },
  })
}
exports.down = (pgm) => {
  pgm.dropTable('passports')
}
