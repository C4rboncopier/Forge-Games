import connectToDatabase from './dbConnection.js';
import { supabase } from './dbConnection.js';

const { client } = connectToDatabase;
const bucketName = process.env.SUPABASE_BUCKET;

const getPublicUrl = async (bucketName, filePath) => {
    try {
        if (!bucketName || !filePath) return null;

        const { data, error } = supabase.storage
            .from(bucketName)
            .getPublicUrl(`games/${filePath}`);

        if (error) {
            console.error('Error retrieving public URL:', error);
            return null;
        }

        return data.publicUrl;
    } catch (error) {
        console.error('Unexpected error in getPublicUrl:', error);
        return null;
    }
};

export const getCart = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Join cart_item with games table to get game details
        const cart = await client.query(`
            SELECT g.*, ci.username 
            FROM cart_item ci
            JOIN games g ON ci.game_id = g.id
            WHERE ci.username = $1;
        `, [username]);

        if (cart.rows.length === 0) {
            return res.json([]);
        }

        const cartWithUrls = await Promise.all(cart.rows.map(async (game) => {
            const url = await getPublicUrl(bucketName, game.image_name);
            return {
                ...game,
                gameUrl: url || null
            };
        }));

        res.json(cartWithUrls);
    } catch (error) {
        console.error('Error in getCart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cart'
        });
    }
};

export const addToCart = async (req, res) => {
    const { username, title } = req.body;

    if (!username || !title) {
        return res.status(400).json({
            success: false,
            error: 'Username and title are required'
        });
    }

    try {
        // First, get the game_id from the games table
        const gameQuery = await client.query(
            'SELECT id FROM games WHERE title = $1',
            [title]
        );

        if (gameQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        const gameId = gameQuery.rows[0].id;

        // Check if the game already exists in the cart for this user
        const checkExisting = await client.query(
            'SELECT * FROM cart_item WHERE username = $1 AND game_id = $2',
            [username, gameId]
        );

        if (checkExisting.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Game already exists in cart'
            });
        }

        // Add the game to the cart
        const insertQuery = `
            INSERT INTO cart_item (username, game_id)
            VALUES ($1, $2)
            RETURNING *;
        `;

        const cartItem = await client.query(insertQuery, [username, gameId]);

        // Get the complete game details for the response
        const gameDetails = await client.query(
            'SELECT * FROM games WHERE id = $1',
            [gameId]
        );

        const game = gameDetails.rows[0];
        const imageUrl = await getPublicUrl(bucketName, game.image_name);

        res.json({
            success: true,
            message: 'Game added to cart successfully',
            product: {
                ...game,
                gameUrl: imageUrl
            }
        });
    } catch (error) {
        console.error('Error in addToCart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add game to cart'
        });
    }
};

export const removeFromCart = async (req, res) => {
    const { username, gameId } = req.body;

    try {
        await client.query('DELETE FROM cart_item WHERE username = $1 AND game_id = $2', [username, gameId]);
        res.json({ success: true, message: 'Game removed from cart successfully' });
    } catch (error) {
        console.error('Error in removeFromCart:', error);
        res.status(500).json({ success: false, error: 'Failed to remove game from cart' });
    }
}
