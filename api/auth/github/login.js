const crypto = require('crypto');

module.exports = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `https://${req.headers.host}/api/auth/github/callback`;

  if (!clientId) {
    res.status(500).setHeader('Content-Type', 'text/html');
    return res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>OAuth Configuration Error - GitHub Green Squares</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #f0f6fc; padding: 40px; text-align: center; }
          .card { max-width: 500px; margin: 50px auto; background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 30px; }
          h2 { color: #f85149; }
          a { color: #58a6ff; text-decoration: none; }
          code { background: #21262d; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>⚠️ OAuth Setup Required</h2>
          <p>The <code>GITHUB_CLIENT_ID</code> environment variable is not configured on this Vercel deployment.</p>
          <p>Please configure <code>GITHUB_CLIENT_ID</code>, <code>GITHUB_CLIENT_SECRET</code>, and <code>GITHUB_REDIRECT_URI</code> in your Vercel project settings.</p>
          <p><a href="/">← Return to Dashboard (Demo Mode)</a></p>
        </div>
      </body>
      </html>
    `);
  }

  // Generate secure CSRF state
  const state = crypto.randomBytes(24).toString('hex');
  const isSecure = req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';

  // Set HTTP-only state cookie
  res.setHeader('Set-Cookie', `gh_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${isSecure ? '; Secure' : ''}`);

  const scope = 'read:user'; // Minimal permission, no broad private repo access
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

  res.writeHead(302, { Location: githubAuthUrl });
  res.end();
};
