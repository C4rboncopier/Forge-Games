import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import { checkLogIn, addUser } from "./backend/auth-api.js";
import { addGame, getGames, deleteGame, updateGame, getGameById } from "./backend/adminPage.js";
import { getGamesByGenre } from "./backend/genre-api.js";
import { addToCart, getCart, removeFromCart, processCheckout } from "./backend/cart-api.js";
import { getUserLibrary } from "./backend/library-api.js";
import { getFavorites, addToFavorites, removeFromFavorites } from './backend/favorites-api.js';
import { getGameDetails } from './backend/games-api.js';
import { getTransactions, getAllTransactions } from './backend/transactions-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit
    }
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1},
    { name: 'screenshot1', maxCount: 1 },
    { name: 'screenshot2', maxCount: 1 },
    { name: 'screenshot3', maxCount: 1 }
]);

app.post('/login', checkLogIn);
app.post('/register', addUser);
app.get('/api/admin/games', getGames);
app.get('/api/home', getGames);
app.get('/api/browse/games', getGames);
app.get("/api/genre/:genre", getGamesByGenre);
app.get('/api/cart/:username', getCart);
app.delete('/api/cart/remove', removeFromCart);
app.post('/api/checkout', processCheckout);
app.get('/api/library/:username', getUserLibrary);
app.get("/games/:title", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'game.html'));
});

app.delete('/admin/games/:id', deleteGame);
app.put('/admin/games/:id', upload, updateGame);
app.get('/api/admin/games/:id', async (req, res) => {
    try {
        await getGameById(req, res);
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error occurred'
        });
    }
});

app.post('/admin/upload', upload, (req, res) => {
    console.log('Upload endpoint hit');
    return addGame(req, res);
});
app.post('/api/cart/add', addToCart);

app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/scripts', express.static(path.join(__dirname, '/scripts')));
app.use('/assets', express.static(path.join(__dirname, '/assets')));

// HTML routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'main.html'));
});

app.get("/browse", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'browse.html'));
});

app.get("/game", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'game.html'));
})

app.get("/favorite", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'favorite.html'));
});

app.get("/library", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'library.html'));
});

app.get("/genre/:genre", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'genre.html'));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.get("/birthday", (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'birthday.html'));
});

app.get("/validate-age", (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'age-restriction.html'));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'register.html'));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'admin.html'));
});

app.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'cart.html'));
});

app.get("/checkout", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'checkout.html'));
});

app.get('/api/favorites/:username', getFavorites);
app.post('/api/favorites/add', addToFavorites);
app.post('/api/favorites/remove', removeFromFavorites);

app.get("/support", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'support.html'));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'about.html'));
});

app.get("/terms", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'terms.html'));
});

app.get("/privacy", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'privacy.html'));
});

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'contact.html'));
});

app.get('/components/header', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'header.html'));
});

app.get('/components/footer', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'footer.html'));
});

app.get('/api/games/details/:title', getGameDetails);

app.get("/transactions", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'transactions.html'));
});

app.get('/api/transactions/:username', getTransactions);

app.get("/admin/transactions", (req, res) => {
    res.sendFile(path.join(__dirname, '/pages', 'transactions.html'));
});

app.get('/api/admin/transactions', getAllTransactions);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Something went wrong!' 
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});