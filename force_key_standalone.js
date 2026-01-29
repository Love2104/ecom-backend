const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');

        console.log('Inserting Debug Key (Standalone)...');
        await client.query("DELETE FROM manager_keys WHERE key_code = 'DEBUG-KEY-9999'");
        const res = await client.query(
            "INSERT INTO manager_keys (key_code, created_by, is_used) VALUES ($1, $2, $3) RETURNING *",
            ['DEBUG-KEY-9999', 'system-debug-standalone', false]
        );
        console.log('KEY CREATED:', res.rows[0].key_code);

        // Also verify the user linked to this key if any, to ensure clean slate?
        // Actually, no, if we just create key, user needs to sign up or be created.
        // Wait, managerLogin checks for User linked to key.
        // If key exists but no user, managerLogin returns "No manager found for this key" (404).

        // So we MUST also ensure a user is linked if we want them to login?
        // OR the user is created via createManager which does both.
        // If the user is trying to LOGIN, they must already exist.
        // If they just have a key but no user, they can't login yet.
        // They need to be created via "createManager" endpoint (Superadmin).

        // Ah! Manager Login is ONLY for existing managers.
        // If the user manually inserted a key but didn't create a user record with that key_id, login will fail with 404 (No manager found).
        // But the error is 401 (Invalid Manager Key). So the key itself is missing.

        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}
run();
