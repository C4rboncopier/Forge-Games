import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';

// Import the backend functions
import { checkLogIn, addUser } from "./backend/auth-api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

app.post('/login', checkLogIn);
app.post('/register', addUser);

// serve static files
app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/scripts', express.static(path.join(__dirname, '/scripts')));
app.use('/assets', express.static(path.join(__dirname, '/assets')));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '/pages', 'main.html'));
});

app.get("/browse", (req, res) => {
  res.sendFile(path.join(__dirname, '/pages', 'browse.html'));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'login.html'))
})

app.get("/birthday", (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'birthday.html'))
})

app.get("/validate-age", (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'age-restriction.html'))
})

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'register.html'))
})



app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(`http://localhost:${port}`);
});
