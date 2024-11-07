import connectToDatabase from './dbConnection.js';
import { supabase } from './dbConnection.js';

const { client } = connectToDatabase;
const bucketName = process.env.SUPABASE_BUCKET;

const getPublicUrl = async (bucketName, filePath) => {
    try {
        if (!bucketName || !filePath) {
            console.error('Missing required parameters:', { bucketName, filePath });
            return null;
        }

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

export const displayGames = async (req, res) => {
    try {
        const game = await client.query(`
            SELECT id, title, description, developer, genre, price, createdat, modifiedat, image_name, banner_name, screenshot1, screenshot2, screenshot3
            FROM games
            ORDER BY createdat DESC;
        `);
        
        if (game.rows.length === 0) {
            return res.json([]);  // Return empty array if no games are found
        }

        const newResult = await Promise.all(game.rows.map(async (game) => {
            const url = await getPublicUrl(bucketName, game.image_name);
            const bannerUrl = await getPublicUrl(bucketName, game.banner_name)
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
        return res.json(newResult);

    } catch (error) {
        console.error('Error in displayGames:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch games' 
        });
    }
};
