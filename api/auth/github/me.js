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
  res.setHeader('Content-Type', 'application/json');

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['gh_session'];

  if (!token) {
    return res.status(200).json({ authenticated: false });
  }

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/user',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Green-Squares-V2'
    }
  };

  const fetchUser = () => new Promise((resolve, reject) => {
    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        resolve({ status: apiRes.statusCode, data });
      });
    });
    apiReq.on('error', (err) => reject(err));
    apiReq.end();
  });

  try {
    const result = await fetchUser();

    if (result.status === 401) {
      // Token expired or revoked
      res.setHeader('Set-Cookie', 'gh_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
      return res.status(200).json({ authenticated: false, error: 'session_expired' });
    }

    if (result.status === 403) {
      return res.status(200).json({ authenticated: false, error: 'rate_limited' });
    }

    if (result.status !== 200) {
      return res.status(200).json({ authenticated: false, error: `github_api_error_${result.status}` });
    }

    const userData = JSON.parse(result.data);

    // Return safe user profile (Never expose the token!)
    return res.status(200).json({
      authenticated: true,
      user: {
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        bio: userData.bio || '',
        public_repos: userData.public_repos || 0,
        followers: userData.followers || 0,
        following: userData.following || 0,
        created_at: userData.created_at
      }
    });
  } catch (err) {
    console.error('Error in /api/auth/github/me:', err);
    return res.status(500).json({ authenticated: false, error: 'internal_server_error' });
  }
};
