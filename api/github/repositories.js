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
    return res.status(401).json({ error: 'unauthorized', message: 'GitHub session token required.' });
  }

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/user/repos?sort=updated&per_page=30&type=all',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Green-Squares-V2'
    }
  };

  const fetchRepos = () => new Promise((resolve, reject) => {
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
    const result = await fetchRepos();

    if (result.status === 401) {
      return res.status(401).json({ error: 'session_expired', message: 'GitHub session expired. Please reconnect.' });
    }

    if (result.status === 403) {
      return res.status(403).json({ error: 'rate_limited', message: 'GitHub API rate limit reached.' });
    }

    const reposData = JSON.parse(result.data);

    if (!Array.isArray(reposData)) {
      return res.status(500).json({ error: 'invalid_data', message: 'Unexpected response from GitHub repositories API.' });
    }

    const cleanRepos = reposData.map((repo) => ({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || 'No description provided.',
      language: repo.language || 'Plain text',
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      updated_at: repo.updated_at,
      html_url: repo.html_url,
      is_private: repo.private || false
    }));

    return res.status(200).json({ success: true, repositories: cleanRepos });
  } catch (err) {
    console.error('Error in /api/github/repositories:', err);
    return res.status(500).json({ error: 'server_error', message: 'Unable to retrieve GitHub repositories.' });
  }
};
