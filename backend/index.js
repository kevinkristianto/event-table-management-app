const express = require('express');
const cors = require('cors');
const db = require('./models/initDb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// GET all layout names
app.get('/api/layouts', (req, res) => {
  const query = `SELECT name FROM layouts`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('DB error fetching layout names:', err);
      return res.status(500).json({ error: 'Failed to fetch layouts' });
    }
    const names = rows.map(row => row.name);
    res.json(names);
  });
});

// GET layout by name
app.get('/api/layouts/:name', (req, res) => {
  const name = req.params.name;
  const query = `SELECT data FROM layouts WHERE name = ?`;
  db.get(query, [name], (err, row) => {
    if (err) {
      console.error('DB error fetching layout:', err);
      return res.status(500).json({ error: 'Failed to fetch layout' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    // data is stored as JSON string, parse before sending
    try {
      const data = JSON.parse(row.data);
      res.json({ name, elements: data });
    } catch (parseErr) {
      console.error('Error parsing layout JSON:', parseErr);
      res.status(500).json({ error: 'Corrupted layout data' });
    }
  });
});

// POST save or update layout
app.post('/api/layouts', (req, res) => {
  const { name, elements } = req.body;

  if (!name || !elements) {
    return res.status(400).json({ error: 'Invalid layout data' });
  }

  const dataStr = JSON.stringify(elements);

  // Check if layout exists
  const checkQuery = `SELECT id FROM layouts WHERE name = ?`;
  db.get(checkQuery, [name], (err, row) => {
    if (err) {
      console.error('DB error checking layout existence:', err);
      return res.status(500).json({ error: 'Failed to save layout' });
    }

    if (row) {
      // Update existing
      const updateQuery = `UPDATE layouts SET data = ? WHERE id = ?`;
      db.run(updateQuery, [dataStr, row.id], function(updateErr) {
        if (updateErr) {
          console.error('DB error updating layout:', updateErr);
          return res.status(500).json({ error: 'Failed to update layout' });
        }
        res.json({ message: 'Layout updated', name });
      });
    } else {
      // Insert new
      const insertQuery = `INSERT INTO layouts (name, data) VALUES (?, ?)`;
      db.run(insertQuery, [name, dataStr], function(insertErr) {
        if (insertErr) {
          console.error('DB error inserting layout:', insertErr);
          return res.status(500).json({ error: 'Failed to save layout' });
        }
        res.json({ message: 'Layout saved', name });
      });
    }
  });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
