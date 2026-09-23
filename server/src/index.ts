import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { extractAddresses, verifyMany } from './verify';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.post('/api/verify', async (req, res) => {
  try {
    const { text } = req.body;

    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid payload: text field must be a string.' });
    }

    if (text.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Payload too large. Maximum supported text size is 5 MB.' });
    }

    // 1. Extract and normalize addresses & deduplicate
    const { addresses, duplicatesCount } = extractAddresses(text);

    // 2. Run worker pool verification
    const results = await verifyMany(addresses, 20);

    // 3. Compute statistics
    const validCount = results.filter((r) => r.status === 'VALID').length;
    const riskyCount = results.filter((r) => r.status === 'RISKY').length;
    const invalidCount = results.filter((r) => r.status === 'INVALID').length;

    const stats = {
      total: addresses.length + duplicatesCount,
      unique: addresses.length,
      duplicates: duplicatesCount,
      VALID: validCount,
      RISKY: riskyCount,
      INVALID: invalidCount
    };

    return res.json({ results, stats });
  } catch (error) {
    console.error('Error during email verification:', error);
    return res.status(500).json({ error: 'Internal server error during email verification.' });
  }
});

// Serve client static build in production if present
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Email Cleaner Server running on port ${PORT}`);
});
