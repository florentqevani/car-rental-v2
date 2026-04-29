
const Pool = require('pg').Pool;
const config = require('./config');

const pool = new Pool({
    connectionString: config.authdbUrl,
});
pool.on('connect', () => {
    console.log('Connected to the database');
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;