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

const checkGameInLibrary = async (userId, gameId) => {
    const result = await client.query(
        'SELECT * FROM user_library WHERE user_id = $1 AND game_id = $2',
        [userId, gameId]
    );
    return result.rows.length > 0;
};

export const getCart = async (req, res) => {
    try {
        const { username } = req.params;
        
        // First get the user_id from users table
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
        
        // Modified query to use user_id instead of username
        const cart = await client.query(`
            SELECT g.*, ci.user_id 
            FROM cart_item ci
            JOIN games g ON ci.game_id = g.id
            WHERE ci.user_id = $1;
        `, [userId]);

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
        // First get the user_id from users table
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

        // Get the game_id from the games table
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

        // Check if game is in library
        const inLibrary = await checkGameInLibrary(userId, gameId);
        if (inLibrary) {
            return res.status(409).json({
                success: false,
                error: 'GAME_IN_LIBRARY'
            });
        }

        // Check if the game already exists in the cart for this user
        const checkExisting = await client.query(
            'SELECT * FROM cart_item WHERE user_id = $1 AND game_id = $2',
            [userId, gameId]
        );

        if (checkExisting.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Game already exists in cart'
            });
        }

        // Add the game to the cart with user_id
        const insertQuery = `
            INSERT INTO cart_item (user_id, game_id)
            VALUES ($1, $2)
            RETURNING *;
        `;

        const cartItem = await client.query(insertQuery, [userId, gameId]);

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
        // First get the user_id from users table
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

        await client.query(
            'DELETE FROM cart_item WHERE user_id = $1 AND game_id = $2', 
            [userId, gameId]
        );
        
        res.json({ success: true, message: 'Game removed from cart successfully' });
    } catch (error) {
        console.error('Error in removeFromCart:', error);
        res.status(500).json({ success: false, error: 'Failed to remove game from cart' });
    }
}

const recordTransaction = async (userId, games, method, total) => {
    try {
        // Convert games array to comma-separated string
        const gamesString = games.map(game => game.title).join(', ');
        
        const query = `
            INSERT INTO transactions (user_id, games, method, total, createdat)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *;
        `;
        
        const result = await client.query(query, [userId, gamesString, method, total]);
        return result.rows[0];
    } catch (error) {
        console.error('Error recording transaction:', error);
        throw error;
    }
};

export const processCheckout = async (req, res) => {
    const { username, paymentMethod } = req.body;

    try {
        // Get user_id
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

        // Get cart items
        const cartQuery = await client.query(`
            SELECT g.* 
            FROM cart_item ci
            JOIN games g ON ci.game_id = g.id
            WHERE ci.user_id = $1;
        `, [userId]);

        const cartItems = cartQuery.rows;
        
        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Cart is empty'
            });
        }

        // Calculate total
        const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
        const tax = subtotal * 0.12; // 12% tax
        const total = subtotal + tax;

        // Record the transaction
        await recordTransaction(userId, cartItems, paymentMethod, total);

        // Add games to user's library
        for (const game of cartItems) {
            // Check if game already exists in user's library
            const libraryCheck = await client.query(
                'SELECT * FROM user_library WHERE user_id = $1 AND game_id = $2',
                [userId, game.id]
            );

            // Only add if game isn't already in library
            if (libraryCheck.rows.length === 0) {
                await client.query(
                    'INSERT INTO user_library (user_id, game_id) VALUES ($1, $2)',
                    [userId, game.id]
                );
            }
        }

        // Clear the cart
        await client.query(
            'DELETE FROM cart_item WHERE user_id = $1',
            [userId]
        );

        res.json({
            success: true,
            message: 'Transaction completed successfully'
        });
    } catch (error) {
        console.error('Error processing checkout:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process checkout'
        });
    }
};
