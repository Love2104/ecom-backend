import { query } from '../config/db';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createDebugKey = async () => {
    try {
        console.log('Inserting Debug Key...');
        // Delete old debug key if exists to avoid collision
        await query("DELETE FROM manager_keys WHERE key_code = 'DEBUG-KEY-9999'");

        // Insert new one
        const result = await query(
            `INSERT INTO manager_keys (key_code, created_by, is_used) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            ['DEBUG-KEY-9999', 'system-debug', false]
        );

        console.log('SUCCESS: Valid Manager Key created:');
        console.log(JSON.stringify(result.rows[0], null, 2));

        // Verify it exists in find
        const verify = await query("SELECT * FROM manager_keys WHERE key_code = 'DEBUG-KEY-9999'");
        console.log('Verification check:', verify.rows.length > 0 ? 'FOUND' : 'NOT FOUND');

        process.exit(0);
    } catch (error) {
        console.error('FAILED:', error);
        process.exit(1);
    }
};

createDebugKey();
