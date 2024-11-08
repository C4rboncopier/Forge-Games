import connectToDatabase from './dbConnection.js';
const { client } = connectToDatabase;

export const getGameDetails = async (req, res) => {
    const { title } = req.params;

    try {
        const query = 'SELECT * FROM games WHERE title = $1';
        const result = await client.query(query, [title]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game details'
        });
    }
}; 