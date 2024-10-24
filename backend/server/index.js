import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const frontendPath = path.resolve(__dirname, '../../frontend');
const backendPath = path.resolve(__dirname, '../../backend');

// Serve static files from frontend and backend directories
app.use(express.static(frontendPath));
app.use('/backend', express.static(backendPath)); // Serve backend scripts

app.get('/main', (req, res) => {
  res.sendFile(path.join(frontendPath, 'pages/main.html'));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(`http://localhost:${port}/main`);
});
