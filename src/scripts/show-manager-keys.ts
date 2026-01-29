import { query } from '../config/db';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const showKeys = async () => {
    try {
        console.log('Connecting to database...');
        const res = await query('SELECT * FROM manager_keys WHERE is_used = false');
        console.log('--- VALID MANAGER KEYS ---');
        console.table(res.rows);

        // Also show users to see if any managers exist
        const users = await query("SELECT id, name, email, role FROM users WHERE role = 'MANAGER'");
        console.log('--- EXISTING MANAGERS ---');
        console.table(users.rows);

        process.exit(0);
    } catch (error) {
        console.error('Error fetching keys:', error);
        process.exit(1);
    }
};

showKeys();
