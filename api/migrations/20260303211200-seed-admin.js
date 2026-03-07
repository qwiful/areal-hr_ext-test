const argon2 = require('argon2')

exports.up = async (pgm) => {
  const hash = await argon2.hash('admin', { type: argon2.argon2id })

  pgm.sql(`
    INSERT INTO "authorization" (login, password)
    VALUES ('admin', '${hash}')
  `)
  pgm.sql(`
    INSERT INTO specialist (surname, name, id_authorization, id_role)
    VALUES ('Администратор', 'Главный', 1, 1)
  `)
}

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM specialist WHERE id_authorization = 1`)
  pgm.sql(`DELETE FROM "authorization" WHERE login = 'admin'`)
}
