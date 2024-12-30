// src/utils/database.js
import serverlessMysql from 'serverless-mysql';

const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

const db = serverlessMysql({
  config: {
    host: dbHost,
    database: dbName,
    user: dbUsername,
    password: dbPassword,
  },
});

export async function connect() {
  return db.connect();
}

export async function query(sql, values) {
  return db.query(sql, values);
}

export async function close() {
  return db.end();
}
