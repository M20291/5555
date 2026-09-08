import express from 'express';
import { magnetHandler } from './api/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Route for magnet download
app.post('/api', magnetHandler);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Magnet to Drive API is running',
    endpoints: {
      '/api': 'POST - Download from magnet and upload to Drive'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});