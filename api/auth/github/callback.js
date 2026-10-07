const https = require('https');

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
}

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error) {
    res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent(errorDescription || error)}` });
    return res.end();
  }

  if (!code || !state) {
    res.writeHead(302, { Location: '/?auth_error=missing_code_or_state' });
    return res.end();
  }

  // Validate state against cookie
  const cookies = parseCookies(req.headers.cookie);
  const storedState = cookies['gh_oauth_state'];

  if (!storedState || storedState !== state) {
    res.writeHead(302, { Location: '/?auth_error=invalid_csrf_state' });
    return res.end();
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `https://${req.headers.host}/api/auth/github/callback`;

  if (!clientId || !clientSecret) {
    res.writeHead(302, { Location: '/?auth_error=missing_server_credentials' });
    return res.end();
  }

  // Exchange code for access_token with GitHub
  const postData = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri
  });

  const requestOptions = {
    hostname: 'github.com',
    port: 443,
    path: '/login/oauth/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'GitHub-Green-Squares-V2',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const exchangeToken = () => new Promise((resolve, reject) => {
    const tokenReq = https.request(requestOptions, (tokenRes) => {
      let data = '';
      tokenRes.on('data', (chunk) => { data += chunk; });
      tokenRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Invalid JSON received from GitHub token exchange'));
        }
      });
    });

    tokenReq.on('error', (err) => reject(err));
    tokenReq.write(postData);
    tokenReq.end();
  });

  try {
    const tokenData = await exchangeToken();

    if (tokenData.error || !tokenData.access_token) {
      const errReason = tokenData.error_description || tokenData.error || 'token_exchange_failed';
      res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent(errReason)}` });
      return res.end();
    }

    const isSecure = req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
    const maxAge = 60 * 60 * 24 * 14; // 14 days session

    // Set secure HTTP-only session cookie and clear state cookie
    res.setHeader('Set-Cookie', [
      `gh_session=${tokenData.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure ? '; Secure' : ''}`,
      `gh_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure ? '; Secure' : ''}`
    ]);

    res.writeHead(302, { Location: '/?auth=success' });
    res.end();
  } catch (err) {
    console.error('OAuth token exchange error:', err);
    res.writeHead(302, { Location: '/?auth_error=network_error_during_token_exchange' });
    res.end();
  }
};
