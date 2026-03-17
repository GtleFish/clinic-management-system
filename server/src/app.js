require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);