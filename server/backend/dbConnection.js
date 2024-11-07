import pkg from 'pg';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const {Client} = pkg;

dotenv.config({ path: './server/backend/.env' });
const dbURL = process.env.DB_PROJECT;
const dbPass = process.env.DB_PASSWORD;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
    connectionString: `postgresql://postgres.opralkrabelemyuylwou:${dbPass}@${dbURL}.supabase.com:6543/postgres`, // Replace with actual Supabase credentials
    ssl: { rejectUnauthorized: false }, // Ensures a secure SSL connection
});

// Connect to the database
async function connectToDatabase() {
    try {
      await client.connect();
      console.log('Connected to Supabase PostgreSQL Successfully');
    } catch (error) {
      console.error('Connection error', error.stack);
    }
}

// Export the client and connection function (optional)
export default { client, connectToDatabase };

// Call the function to establish the connection
connectToDatabase();