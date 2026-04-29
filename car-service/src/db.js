const pg = require('pg');
const config = require('./config');

const pool = new pg.Pool({
    connectionString: config.dbUrl,
});
pool.on('connect', () => {
    console.log('Connected to the database');
});
pool.on('error', (err) => {
    console.error('Database connection error:', err);
});
module.exports = pool;