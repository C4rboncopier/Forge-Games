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

export const getFavorites = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Get user_id from users table
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
        
        // Get favorites with game details
        const favorites = await client.query(`
            SELECT g.* 
            FROM user_favorites uf
            JOIN games g ON uf.game_id = g.id
            WHERE uf.user_id = $1;
        `, [userId]);

        if (favorites.rows.length === 0) {
            return res.json([]);
        }

        const favoritesWithUrls = await Promise.all(favorites.rows.map(async (game) => {
            // Get URLs for all images
            const gameUrl = await getPublicUrl(bucketName, game.image_name);
            const bannerUrl = await getPublicUrl(bucketName, game.banner_name);
            const screenshot1Url = await getPublicUrl(bucketName, game.screenshot1_name);
            const screenshot2Url = await getPublicUrl(bucketName, game.screenshot2_name);
            const screenshot3Url = await getPublicUrl(bucketName, game.screenshot3_name);

            return {
                ...game,
                gameUrl: gameUrl || null,
                banner_url: bannerUrl || null,
                screenshot1_url: screenshot1Url || null,
                screenshot2_url: screenshot2Url || null,
                screenshot3_url: screenshot3Url || null
            };
        }));

        res.json(favoritesWithUrls);
    } catch (error) {
        console.error('Error in getFavorites:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch favorites'
        });
    }
};

export const addToFavorites = async (req, res) => {
    const { username, title } = req.body;

    if (!username || !title) {
        return res.status(400).json({
            success: false,
            error: 'Username and title are required'
        });
    }

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

        // Get game_id
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

        // Check if already in favorites
        const checkExisting = await client.query(
            'SELECT * FROM user_favorites WHERE user_id = $1 AND game_id = $2',
            [userId, gameId]
        );

        if (checkExisting.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Game already in favorites'
            });
        }

        // Add to favorites
        const insertQuery = `
            INSERT INTO user_favorites (user_id, game_id)
            VALUES ($1, $2)
            RETURNING *;
        `;

        await client.query(insertQuery, [userId, gameId]);

        // Get game details for response
        const gameDetails = await client.query(
            'SELECT * FROM games WHERE id = $1',
            [gameId]
        );

        const game = gameDetails.rows[0];
        const imageUrl = await getPublicUrl(bucketName, game.image_name);

        res.json({
            success: true,
            message: 'Game added to favorites successfully',
            game: {
                ...game,
                gameUrl: imageUrl
            }
        });
    } catch (error) {
        console.error('Error in addToFavorites:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add game to favorites'
        });
    }
};

export const removeFromFavorites = async (req, res) => {
    const { username, gameId } = req.body;

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

        await client.query(
            'DELETE FROM user_favorites WHERE user_id = $1 AND game_id = $2',
            [userId, gameId]
        );

        res.json({
            success: true,
            message: 'Game removed from favorites successfully'
        });
    } catch (error) {
        console.error('Error in removeFromFavorites:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove game from favorites'
        });
    }
}; 