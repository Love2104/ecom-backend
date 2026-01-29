import { query } from '../config/db';

export interface ManagerKey {
    id: string;
    key_code: string;
    assigned_email?: string;
    is_used: boolean;
    created_by: string;
    created_at: Date;
}

export class ManagerKeyModel {
    static async create(params: { created_by: string; assigned_email?: string; key_code?: string }): Promise<ManagerKey> {
        // Generate a random key if not provided
        const key_code = params.key_code || `MGR-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        const result = await query(
            `INSERT INTO manager_keys (key_code, assigned_email, created_by) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [key_code, params.assigned_email || null, params.created_by]
        );

        return result.rows[0];
    }

    static async findByKey(key_code: string): Promise<ManagerKey | null> {
        const result = await query('SELECT * FROM manager_keys WHERE key_code = $1', [key_code]);
        return result.rows[0] || null;
    }

    static async markAsUsed(id: string): Promise<void> {
        await query('UPDATE manager_keys SET is_used = TRUE WHERE id = $1', [id]);
    }
}
