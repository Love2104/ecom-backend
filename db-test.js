require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

function log(msg) {
    fs.appendFileSync('db-test.log', msg + '\n');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL is undefined');
    process.exit(1);
}

log('Testing connection to: ' + process.env.DATABASE_URL.split('@')[1]);

pool.connect()
    .then(client => {
        log('✅ Successfully connected to Neon DB!');
        client.release();
        process.exit(0);
    })
    .catch(err => {
        log('❌ Connection Failed: ' + err.message);
        process.exit(1);
    });
