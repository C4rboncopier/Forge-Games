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

export const getGamesByGenre = async (req, res) => {
    try {
        const { genre } = req.params;
        const decodedGenre = decodeURIComponent(genre);
        
        const games = await client.query(`
            SELECT id, title, description, developer, genre, price, createdat, modifiedat, image_name, banner_name, screenshot1, screenshot2, screenshot3
            FROM games
            WHERE LOWER(genre) = LOWER($1)
            ORDER BY createdat DESC;
        `, [decodedGenre]);
        
        if (games.rows.length === 0) {
            return res.json([]);
        }

        const gamesWithUrls = await Promise.all(games.rows.map(async (game) => {
            const url = await getPublicUrl(bucketName, game.image_name);
            const bannerUrl = await getPublicUrl(bucketName, game.banner_name);
            const screenshot1Url = await getPublicUrl(bucketName, game.screenshot1);
            const screenshot2Url = await getPublicUrl(bucketName, game.screenshot2);
            const screenshot3Url = await getPublicUrl(bucketName, game.screenshot3);
            return {
                ...game,
                gameUrl: url || null,
                bannerUrl: bannerUrl || null,
                screenshot1Url: screenshot1Url || null,
                screenshot2Url: screenshot2Url || null,
                screenshot3Url: screenshot3Url || null
            };
        }));

        return res.json(gamesWithUrls);
    } catch (error) {
        console.error('Error in getGamesByGenre:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch games by genre' 
        });
    }
};