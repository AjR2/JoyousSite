const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for frontend requests
const cors = require('cors');

// Enable CORS for specific origin
app.use(
    cors({
        origin: 'http://localhost:3000', // Replace with your frontend's URL
        methods: ['GET', 'POST'],        // Allowed HTTP methods
        allowedHeaders: ['Content-Type'], // Allowed headers
    })
);
app.options('*', cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./blog.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        content TEXT NOT NULL
      )
    `);
    }
});

// Get all posts
app.get('/posts', (req, res) => {
    db.all('SELECT id, title, date FROM posts', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get a single post by ID
app.get('/posts/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Post not found' });
        } else {
            res.json(row);
        }
    });
});

// Add a new post (optional for testing)
app.post('/posts', (req, res) => {
    const { title, date, content } = req.body;
    db.run(
        'INSERT INTO posts (title, date, content) VALUES (?, ?, ?)',
        [title, date, content],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id: this.lastID });
            }
        }
    );
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});