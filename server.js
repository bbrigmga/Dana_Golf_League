const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files with logging
app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    next();
});

app.use('/', express.static(__dirname, {
    setHeaders: (res, path) => {
        if (path.endsWith('.jpg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        }
    }
}));

// Initialize database connection
const db = new Database('roster.db');

// Get raw data for debugging
app.get('/api/debug', (req, res) => {
    try {
        const teams = db.prepare('SELECT * FROM roster').all();
        console.log('Debug - Database records:', teams);
        res.json(teams);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Get all teams
app.get('/api/teams', (req, res) => {
    try {
        const teams = db.prepare('SELECT * FROM roster').all();
        console.log('Sending teams data:', teams);
        res.json(teams);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Update team score
app.post('/api/teams/:id/score', (req, res) => {
    const { id } = req.params;
    const { round, score } = req.body;
    
    try {
        const columnName = `round_${round}`;
        const stmt = db.prepare(`UPDATE roster SET ${columnName} = ? WHERE id = ?`);
        stmt.run(score, id);
        res.json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to update score' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Cleanup on exit
process.on('SIGINT', () => {
    db.close();
    process.exit();
});
