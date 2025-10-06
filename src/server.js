/**
 * File: server.js
 * Purpose: Express server that serves a static frontend and exposes two color-conversion REST endpoints.
 *
 * Overview:
 *   - Serves static files from the "public" folder adjacent to this file.
 *   - Routes:
 *       GET /                 -> serves public/index.html
 *       GET /hextorgb/:hex    -> converts a 6-digit hex string to { r, g, b }
 *       GET /rgbtohex/:r/:g/:b-> converts three RGB components to { hex }
 *   - Exports the Express app for testing or embedding.
 *
 * Usage:
 *   1. Place server.js and colorconver.js in the same directory.
 *   2. Create a sibling folder named "public" containing index.html (the frontend).
 *   3. Install dependencies: `npm install express`
 *   4. Start server: `node server.js`
 *   5. Open http://localhost:3001/ in your browser.
 *
 */

const express = require('express');
const path = require('path');
const { hextoRgb, rgbToHex } = require('./colorconver');

const app = express();
const port = 3001;

// Serve static assets from the `public` directory located next to this file.
// The static middleware will return files like /public/style.css or /public/script.js automatically.
app.use(express.static(path.join(__dirname, 'public')));

// Root route: serve the main frontend HTML.
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// API: Convert hex string to RGB.
// Expected path parameter :hex is a 6-digit hex string with or without a leading '#'.
app.get('/hextorgb/:hex', (req, res) => {
    try {
        const rgb = hextoRgb(req.params.hex);
        res.json(rgb);
    } catch (err) {
        // Validation or parsing errors return HTTP 400 with an error message in JSON.
        res.status(400).json({ error: err.message });
    }
});

// API: Convert RGB components to hex.
// Expected path parameters :r, :g, :b are integers in range 0-255.
app.get('/rgbtohex/:r/:g/:b', (req, res) => {
    try {
        const r = Number(req.params.r);
        const g = Number(req.params.g);
        const b = Number(req.params.b);
        const hex = rgbToHex(r, g, b);
        res.json({ hex });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Only start listening when not running under a test environment.
// This pattern makes the app importable by test runners without binding the port.
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log(`Server: localhost:${port}`));
}

// Export the Express app so tests or external runners can attach listeners or use supertest.
module.exports = app;
