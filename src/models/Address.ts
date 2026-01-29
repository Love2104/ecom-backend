import { query } from '../config/db';

export interface Address {
    id: string;
    user_id: string;
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    mobile: string;
    is_default: boolean;
    address_type: 'HOME' | 'WORK' | 'OTHER';
    created_at: Date;
    updated_at: Date;
}

export interface AddressInput {
    user_id: string;
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    mobile: string;
    is_default?: boolean;
    address_type?: 'HOME' | 'WORK' | 'OTHER';
}

export class AddressModel {
    static async create(addressData: AddressInput): Promise<Address> {
        // If set as default, unset other defaults for this user
        if (addressData.is_default) {
            await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [addressData.user_id]);
        }

        const result = await query(
            `INSERT INTO addresses (
        user_id, name, address_line1, address_line2, city, state, postal_code, country, mobile, is_default, address_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                addressData.user_id,
                addressData.name,
                addressData.address_line1,
                addressData.address_line2 || null,
                addressData.city,
                addressData.state,
                addressData.postal_code,
                addressData.country,
                addressData.mobile,
                addressData.is_default || false,
                addressData.address_type || 'HOME'
            ]
        );
        return result.rows[0];
    }

    static async findByUserId(userId: string): Promise<Address[]> {
        const result = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [userId]);
        return result.rows;
    }

    static async findById(id: string): Promise<Address | null> {
        const result = await query('SELECT * FROM addresses WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    static async update(id: string, userId: string, addressData: Partial<AddressInput>): Promise<Address | null> {
        if (addressData.is_default) {
            await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
        }

        let updateQuery = 'UPDATE addresses SET ';
        const values: any[] = [];
        let valueIndex = 1;

        for (const [key, value] of Object.entries(addressData)) {
            if (value !== undefined && key !== 'user_id') {
                updateQuery += `${key} = $${valueIndex}, `;
                values.push(value);
                valueIndex++;
            }
        }

        updateQuery += `updated_at = NOW() WHERE id = $${valueIndex} AND user_id = $${valueIndex + 1} RETURNING *`;
        values.push(id, userId);

        const result = await query(updateQuery, values);
        return result.rows[0] || null;
    }

    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
        return result.rowCount > 0;
    }
}
