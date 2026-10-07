const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// MIME types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// API routes mapping
const API_ROUTES = {
  '/api/auth/github/login': require('./api/auth/github/login'),
  '/api/auth/github/callback': require('./api/auth/github/callback'),
  '/api/auth/github/logout': require('./api/auth/github/logout'),
  '/api/auth/github/me': require('./api/auth/github/me'),
  '/api/github/contributions': require('./api/github/contributions'),
  '/api/github/repositories': require('./api/github/repositories'),
  '/api/github/activity': require('./api/github/activity'),
  '/api/health': require('./api/health'),
  '/api/github/health': require('./api/github/health')
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // Decorate req with query and cookies (Vercel serverless compatibility)
  req.query = Object.fromEntries(urlObj.searchParams);
  req.cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(c => {
      const [k, ...v] = c.trim().split('=');
      if (k) req.cookies[k] = decodeURIComponent(v.join('='));
    });
  }

  // Decorate res with standard helper methods (status, json, redirect)
  if (!res.status) {
    res.status = function(code) {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = function(data) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(data));
      return res;
    };
  }
  if (!res.redirect) {
    res.redirect = function(url, status = 302) {
      res.writeHead(status, { Location: url });
      res.end();
      return res;
    };
  }

  // Handle serverless API routes
  if (API_ROUTES[pathname]) {
    try {
      await API_ROUTES[pathname](req, res);
    } catch (err) {
      console.error(`Error handling ${pathname}:`, err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'internal_server_error', message: err.message }));
      }
    }
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA clean URLs
      filePath = path.join(__dirname, 'index.html');
      fs.readFile(filePath, (err2, content) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GitHub Green Squares local server listening on http://localhost:${PORT}`);
  });
}

module.exports = server;
