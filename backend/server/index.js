import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const frontendPath = path.resolve(__dirname, '../../frontend');

app.use(express.static(frontendPath));

app.get('/main', (req, res) => {
  res.sendFile(path.join(frontendPath, 'pages/main.html'));
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
  console.log(`http://localhost:${port}/main`);
});
