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

export const getUserLibrary = async (req, res) => {
    try {
        const { username } = req.params;
        
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
        
        const libraryQuery = await client.query(`
            SELECT g.* 
            FROM user_library ul
            JOIN games g ON ul.game_id = g.id
            WHERE ul.user_id = $1
            ORDER BY g.title ASC;
        `, [userId]);

        if (libraryQuery.rows.length === 0) {
            return res.json([]);
        }

        const libraryWithUrls = await Promise.all(libraryQuery.rows.map(async (game) => {
            const imageUrl = await getPublicUrl(bucketName, game.image_name);
            const bannerUrl = await getPublicUrl(bucketName, game.banner_name);
            const screenshot1Url = await getPublicUrl(bucketName, game.screenshot1);
            const screenshot2Url = await getPublicUrl(bucketName, game.screenshot2);
            const screenshot3Url = await getPublicUrl(bucketName, game.screenshot3);

            return {
                ...game,
                gameUrl: imageUrl || null,
                bannerUrl: bannerUrl || null,
                screenshot1Url: screenshot1Url || null,
                screenshot2Url: screenshot2Url || null,
                screenshot3Url: screenshot3Url || null
            };
        }));

        res.json(libraryWithUrls);
    } catch (error) {
        console.error('Error in getUserLibrary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch library'
        });
    }
}; 