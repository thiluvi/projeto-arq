import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Coloque a sua senha do MySQL aqui, se tiver
  database: 'arquiteta'
});

export { connection };