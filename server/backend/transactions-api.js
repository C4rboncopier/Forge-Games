import connectToDatabase from './dbConnection.js';
const { client } = connectToDatabase;

export const getTransactions = async (req, res) => {
    const { username } = req.params;
    
    try {
        // First get the user_id from the username
        const userQuery = await client.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const userId = userQuery.rows[0].id;

        // Get all transactions for this user
        const transactionsQuery = await client.query(
            `SELECT id, games, method, total, createdat 
             FROM transactions 
             WHERE user_id = $1 
             ORDER BY createdat DESC`,
            [userId]
        );

        res.json({
            success: true,
            transactions: transactionsQuery.rows
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions'
        });
    }
};

export const getAllTransactions = async (req, res) => {
    try {
        // Get all transactions with username
        const transactionsQuery = await client.query(
            `SELECT t.id, t.user_id, u.username, t.games, t.method, t.total, t.createdat 
                FROM transactions t
                JOIN users u ON t.user_id = u.id
                ORDER BY t.createdat DESC`
        );

        res.json({
            success: true,
            transactions: transactionsQuery.rows
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions'
        });
    }
}; 