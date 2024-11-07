import connectToDatabase from './dbConnection.js';
import { supabase } from './dbConnection.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const { client } = connectToDatabase;

export const checkLogIn = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Query to find the user by username, regardless of role
        const users = await client.query(`SELECT * FROM users WHERE username = $1`, [username]);

        // Check if any user was found
        if (users.rows.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        const user = users.rows[0];

        // Check if the provided password matches the stored password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: 'Invalid password' });
        } else {
            return res.json({ success: true, user: { username: user.username, role: user.role } }); // Return user details if needed
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// REGISTER ACCOUNT FUNCTION
export const addUser = async (req, res) => {
    const { username, password, firstname, lastname, email, country, role } = req.body;
    const createdat = new Date();
    const modifiedat = new Date();

    try {
        // Start transaction
        await client.query('BEGIN');

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        const toUsersTable = `
            INSERT INTO users (username, password, firstname, lastname, email, createdat, modifiedat, country, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;

        const toCartTable = `
            INSERT INTO carts (username, createdat, modifiedat)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const userValues = [username, hashedPassword, firstname, lastname, email, createdat, modifiedat, country, role];
        const cartValues = [username, createdat, modifiedat];

        // Execute both queries within the transaction
        const submitUser = await client.query(toUsersTable, userValues);
        const submitCart = await client.query(toCartTable, cartValues);

        // If we get here, commit the transaction
        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Account created successfully',
            user: submitUser.rows[0],
            cart: submitCart.rows[0],
        });
    } catch (error) {
        // If we get here, rollback the transaction
        await client.query('ROLLBACK');
        
        console.error('Error creating account:', error);
        
        // Send more specific error messages
        if (error.constraint === 'users_username_key') {
            res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        } else if (error.constraint === 'users_email_key') {
            res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Error creating account' 
            });
        }
    }
};

// HASHES THE PASSWORD
export const hashPassword = async (req, res) => {
    const name = 'Admin';
    const users = await client.query(`SELECT password FROM users WHERE role = 'Admin' AND username = '${name}'`);

    if (users.rows.length > 0) {
        console.log(users.rows[0].password);
        const hashedPassword = await bcrypt.hash(users.rows[0].password, 10);

        await client.query(`UPDATE users SET password = '${hashedPassword}' WHERE username = '${name}'`);
        res.status(200).json({ message: 'Password hashed successfully' });
    } else {
        res.status(404).json({ message: 'Admin not found' });
    }
};

