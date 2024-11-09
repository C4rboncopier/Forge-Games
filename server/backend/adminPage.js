import connectToDatabase from './dbConnection.js';
import { supabase } from './dbConnection.js';
import dotenv from 'dotenv';
dotenv.config();

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


export const getGames = async (req, res) => {
    try {
        const game = await client.query(`
            SELECT id, title, description, developer, genre, price, createdat, modifiedat, image_name, banner_name, screenshot1, screenshot2, screenshot3
            FROM games
            ORDER BY createdat DESC;
        `);
        
        if (game.rows.length === 0) {
            return res.json([]);
        }

        const newResult = await Promise.all(game.rows.map(async (game) => {
            const imageUrl = await getPublicUrl(bucketName, game.image_name);
            const bannerUrl = await getPublicUrl(bucketName, game.banner_name)
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
        return res.json(newResult);

    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch games' 
        });
    }
};

export const addGame = async (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ 
            success: false, 
            error: 'Main image is required' 
        });
    }

    const { title, description, developer, genre, price } = req.body;
    const createdat = new Date();
    const modifiedat = new Date();

    if (!title || !description || !developer || !genre || !price) {
        return res.status(400).json({ 
            success: false, 
            error: 'All fields are required' 
        });
    }

    try {
        const currentTimestamp = Date.now();
        const mainImageName = `${currentTimestamp}_${req.files.image[0].originalname}`;
        let bannerName = null, screenshot1Name = null, screenshot2Name = null, screenshot3Name = null;

        if (req.files && req.files.banner) {
            bannerName = `banner_${currentTimestamp}_${req.files.banner[0].originalname}`;
        }

        if (req.files.screenshot1) {
            screenshot1Name = `screenshot1_${currentTimestamp}_${req.files.screenshot1[0].originalname}`;
        }

        if (req.files.screenshot2) {
            screenshot2Name = `screenshot2_${currentTimestamp}_${req.files.screenshot2[0].originalname}`;
        }

        if (req.files.screenshot3) {
            screenshot3Name = `screenshot3_${currentTimestamp}_${req.files.screenshot3[0].originalname}`;
        }

        const imagePath = `games/${mainImageName}`;
        const { data: mainImageData, error: mainImageError } = await supabase.storage
            .from(bucketName)
            .upload(imagePath, req.files.image[0].buffer, {
                contentType: req.files.image[0].mimetype,
                upsert: true
            });

        if (mainImageError) {
            throw new Error(`Failed to upload main image: ${mainImageError.message}`);
        }

        if (req.files && req.files.banner) {
            const bannerPath = `games/${bannerName}`;
            await supabase.storage
                .from(bucketName)
                .upload(bannerPath, req.files.banner[0].buffer, {
                    contentType: req.files.banner[0].mimetype,
                    upsert: true
                });
        }

        if (req.files.screenshot1) {
            const screenshot1Path = `games/${screenshot1Name}`;
            await supabase.storage
                .from(bucketName)
                .upload(screenshot1Path, req.files.screenshot1[0].buffer, {
                    contentType: req.files.screenshot1[0].mimetype,
                    upsert: true
                });
        }

        if (req.files.screenshot2) {
            const screenshot2Path = `games/${screenshot2Name}`;
            await supabase.storage
                .from(bucketName)
                .upload(screenshot2Path, req.files.screenshot2[0].buffer, {
                    contentType: req.files.screenshot2[0].mimetype,
                    upsert: true
                });
        }

        if (req.files.screenshot3) {
            const screenshot3Path = `games/${screenshot3Name}`;
            await supabase.storage
                .from(bucketName)
                .upload(screenshot3Path, req.files.screenshot3[0].buffer, {
                    contentType: req.files.screenshot3[0].mimetype,
                    upsert: true
                });
        }

        const toTable = `
            INSERT INTO games (title, description, developer, genre, price, createdat, modifiedat, image_name, banner_name, screenshot1, screenshot2, screenshot3)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;
        const values = [title, description, developer, genre, price, createdat, modifiedat, mainImageName, bannerName, screenshot1Name, screenshot2Name, screenshot3Name];
        const submit = await client.query(toTable, values);

        const imageUrl = await getPublicUrl(bucketName, mainImageName);
        const banner = bannerName ? await getPublicUrl(bucketName, bannerName) : null;
        const shot1 = screenshot1Name ? await getPublicUrl(bucketName, screenshot1Name) : null;
        const shot2 = screenshot2Name ? await getPublicUrl(bucketName, screenshot2Name) : null;
        const shot3 = screenshot3Name ? await getPublicUrl(bucketName, screenshot3Name) : null;

        res.json({ 
            success: true, 
            message: 'Game added successfully',
            product: {
                ...submit.rows[0],
                gameUrl: imageUrl,
                bannerUrl: banner,
                screenshot1Url: shot1,
                screenshot2Url: shot2,
                screenshot3Url: shot3,
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to add game' 
        });
    }
};

export const deleteGame = async (req, res) => {
    const { id } = req.params;
    
    try {
        const imageQuery = await client.query(
            'SELECT image_name FROM games WHERE id = $1', [id]
        );

        const bannerQuery = await client.query(
            'SELECT banner_name FROM games WHERE id = $1', [id]
        );

        for (let i = 1; i <= 3; i++) {
            const screenshotKey = `screenshot${i}`;
            const screenshotQuery = await client.query(
                `SELECT ${screenshotKey} FROM games WHERE id = $1`, [id]
            );

            await supabase.storage
                .from(bucketName)
                .remove([`games/${screenshotQuery.rows[0][screenshotKey]}`]);
            }
        
        const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([
                `games/${imageQuery.rows[0].image_name}`,
                `games/${bannerQuery.rows[0].banner_name}`
            ]);
            
        if (storageError) {
            console.error('Error deleting images from storage:', storageError);
        }
        
        const result = await client.query(
            'DELETE FROM games WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Game deleted successfully',
            deletedGame: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete game'
        });
    }
};

export const updateGame = async (req, res) => {
    const { id } = req.params;
    const { title, description, developer, genre, price } = req.body;
    const modifiedat = new Date();

    try {
        let updateQuery = `
            UPDATE games 
            SET title = $1, description = $2, developer = $3, genre = $4, 
                price = $5, modifiedat = $6
        `;
        let values = [title, description, developer, genre, price, modifiedat];
        let queryParams = 7;

        const currentTimestamp = Date.now();
        let newImageName = req.body.image_name;
        let newBannerName = req.body.banner_name;
        let newScreenshot1Name = req.body.screenshot1;
        let newScreenshot2Name = req.body.screenshot2;
        let newScreenshot3Name = req.body.screenshot3;

        if (req.files && req.files.image) {
            const oldImageQuery = await client.query(
                'SELECT image_name FROM games WHERE id = $1', [id]
            );

            if (oldImageQuery.rows.length > 0 && oldImageQuery.rows[0].image_name) {
                await supabase.storage
                    .from(bucketName)
                    .remove([`games/${oldImageQuery.rows[0].image_name}`]);
            }

            newImageName = `${currentTimestamp}_${req.files.image[0].originalname}`;
            const imagePath = `games/${newImageName}`;
            await supabase.storage
                .from(bucketName)
                .upload(imagePath, req.files.image[0].buffer, {
                    contentType: req.files.image[0].mimetype,
                    upsert: true
                });

            updateQuery += `, image_name = $${queryParams}`;
            values.push(newImageName);
            queryParams++;
        }

        if (req.files && req.files.banner) { 
            const oldBannerQuery = await client.query(
                'SELECT banner_name FROM games WHERE id = $1', [id]
            );

            if (oldBannerQuery.rows.length > 0 && oldBannerQuery.rows[0].banner_name) {
                await supabase.storage
                    .from(bucketName)
                    .remove([`games/${oldBannerQuery.rows[0].banner_name}`]);
            }

            newBannerName = `banner_${currentTimestamp}_${req.files.banner[0].originalname}`;
            const bannerPath = `games/${newBannerName}`;
            await supabase.storage
                .from(bucketName)
                .upload(bannerPath, req.files.banner[0].buffer, {
                    contentType: req.files.banner[0].mimetype,
                    upsert: true
                });

            updateQuery += `, banner_name = $${queryParams}`;
            values.push(newBannerName);
            queryParams++;
        }

        for (let i = 1; i <= 3; i++) {
            const screenshotKey = `screenshot${i}`;
            if (req.files && req.files[screenshotKey]) {
                const oldScreenshotQuery = await client.query(
                    `SELECT ${screenshotKey} FROM games WHERE id = $1`, [id]
                );

                if (oldScreenshotQuery.rows.length > 0 && oldScreenshotQuery.rows[0][screenshotKey]) {
                    await supabase.storage
                        .from(bucketName)
                        .remove([`games/${oldScreenshotQuery.rows[0][screenshotKey]}`]);
                }

                const screenshotName = `screenshot${i}_${currentTimestamp}_${req.files[screenshotKey][0].originalname}`;
                const screenshotPath = `games/${screenshotName}`;
                await supabase.storage
                    .from(bucketName)
                    .upload(screenshotPath, req.files[screenshotKey][0].buffer, {
                        contentType: req.files[screenshotKey][0].mimetype,
                        upsert: true
                    });

                updateQuery += `, ${screenshotKey} = $${queryParams}`;
                values.push(screenshotName);
                queryParams++;
            }
        }

        updateQuery += ` WHERE id = $${queryParams} RETURNING *`;
        values.push(id);

        const result = await client.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        const imageUrl = await getPublicUrl(bucketName, result.rows[0].image_name);
        const bannerUrl = await getPublicUrl(bucketName, result.rows[0].banner_name);
        const screenshot1Url = await getPublicUrl(bucketName, result.rows[0].screenshot1);
        const screenshot2Url = await getPublicUrl(bucketName, result.rows[0].screenshot2);
        const screenshot3Url = await getPublicUrl(bucketName, result.rows[0].screenshot3);

        res.json({
            success: true,
            message: 'Game updated successfully',
            game: {
                ...result.rows[0],
                gameUrl: imageUrl,
                bannerUrl,
                screenshot1Url,
                screenshot2Url,
                screenshot3Url
            }
        });
    } catch (error) {
        console.error('Error updating game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update game'
        });
    }
};

export const getGameById = async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log('Attempting to fetch game with ID:', id);
        
        const gameId = parseInt(id);
        if (isNaN(gameId)) {
            console.log('Invalid game ID:', id);
            return res.status(400).json({
            success: false,
            error: 'Invalid game ID'
            });
        }

        if (!client) {
            console.error('Database client is not initialized');
            return res.status(500).json({
                success: false,
                error: 'Database connection error'
            });
        }

        const query = `
            SELECT id, title, description, developer, genre, price, image_name, banner_name, screenshot1, screenshot2, screenshot3
            FROM games 
            WHERE id = $1
        `;
        
        console.log('Executing query with ID:', gameId);
        
        const result = await client.query(query, [gameId]);
        
        console.log('Query result:', result.rows);
        
        if (result.rows.length === 0) {
            console.log('No game found with ID:', gameId);
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        const game = result.rows[0];
        const imageUrl = await getPublicUrl(bucketName, game.image_name);
        const bannerUrl = await getPublicUrl(bucketName, game.banner_name);
        const screenshot1Url = await getPublicUrl(bucketName, game.screenshot1);
        const screenshot2Url = await getPublicUrl(bucketName, game.screenshot2);
        const screenshot3Url = await getPublicUrl(bucketName, game.screenshot3);

        const response = {
        success: true,
        data: {
            ...game,
            gameUrl: imageUrl,
            bannerUrl: bannerUrl,
            screenshot1Url: screenshot1Url,
            screenshot2Url: screenshot2Url,
            screenshot3Url: screenshot3Url
        }
        };
        
        console.log('Sending response:', response);
        res.json(response);
        
    } catch (error) {
        console.error('Detailed error in getGameById:', {
            message: error.message,
            stack: error.stack,
            params: { id }
        });
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game details',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};