const { Pool } = require('pg');
const express = require('express');

const cors = require('cors');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'calisthenics',
    password: 'calisthenics',
    port: 5432,
});

const app = express();
app.use(express.json());
app.use(cors());

app.post('/record-exercise', async (req, res) => {
  try {
    const { name, count, exerciseType } = req.body;
    const tableName = exerciseType.toLowerCase(); // Make sure this matches your table names in database
    
    const result = await pool.query(
      `INSERT INTO ${tableName} (name, count) VALUES ($1, $2) RETURNING *;`,
      [name, count]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error during database operation', err.message);
    res.status(500).json('Server error');
  }
});

app.get('/leaderboard/:exerciseType', async (req, res) => {
  try {
    const { exerciseType } = req.params;
    const tableName = exerciseType.toLowerCase();
    
    const result = await pool.query(
      `SELECT name, count FROM ${tableName} ORDER BY count DESC LIMIT 10;`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error during database operation', err.message);
    res.status(500).json('Server error cannot get result from database');
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
