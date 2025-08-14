const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'uploads')}`);
  console.log(`Test URL: http://localhost:${PORT}/uploads/profiles/1755187150438-280611040-Screenshot%202025-08-06%20at%209.25.46%20PM.png`);
});
