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

function httpsGet(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Green-Squares-V2'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['gh_session'];

  if (!token) {
    return res.status(401).json({ error: 'unauthorized', message: 'GitHub session token required.' });
  }

  try {
    // 1. Get authenticated user login
    const userRes = await httpsGet('/user', token);
    if (userRes.status !== 200) {
      return res.status(userRes.status).json({ error: 'failed_to_fetch_user' });
    }
    const user = JSON.parse(userRes.data);

    // 2. Fetch public events
    const eventsRes = await httpsGet(`/users/${user.login}/events/public?per_page=30`, token);
    if (eventsRes.status !== 200) {
      return res.status(eventsRes.status).json({ error: 'failed_to_fetch_events' });
    }
    const events = JSON.parse(eventsRes.data);

    if (!Array.isArray(events)) {
      return res.status(200).json({ success: true, activities: [] });
    }

    const cleanActivities = [];

    events.forEach((evt) => {
      const dateStr = evt.created_at ? evt.created_at.split('T')[0] : '';
      const repoName = evt.repo ? evt.repo.name : 'Unknown';
      const repoUrl = `https://github.com/${repoName}`;

      if (evt.type === 'PushEvent') {
        const commitCount = evt.payload && evt.payload.commits ? evt.payload.commits.length : 1;
        const firstMessage = evt.payload && evt.payload.commits && evt.payload.commits[0] ? evt.payload.commits[0].message : 'Git push';
        cleanActivities.push({
          id: evt.id,
          type: 'PushEvent',
          typeLabel: 'Commit',
          icon: '💻',
          count: commitCount,
          date: dateStr,
          timestamp: evt.created_at,
          repository: repoName,
          repoUrl,
          message: firstMessage,
          url: repoUrl
        });
      } else if (evt.type === 'PullRequestEvent') {
        const action = evt.payload ? evt.payload.action : 'opened';
        const prTitle = evt.payload && evt.payload.pull_request ? evt.payload.pull_request.title : 'Pull Request';
        const prUrl = evt.payload && evt.payload.pull_request ? evt.payload.pull_request.html_url : repoUrl;
        cleanActivities.push({
          id: evt.id,
          type: 'PullRequestEvent',
          typeLabel: 'Pull Request',
          icon: '🔀',
          count: 1,
          date: dateStr,
          timestamp: evt.created_at,
          repository: repoName,
          repoUrl,
          message: `${action.toUpperCase()}: ${prTitle}`,
          url: prUrl
        });
      } else if (evt.type === 'IssuesEvent') {
        const action = evt.payload ? evt.payload.action : 'opened';
        const issueTitle = evt.payload && evt.payload.issue ? evt.payload.issue.title : 'Issue';
        const issueUrl = evt.payload && evt.payload.issue ? evt.payload.issue.html_url : repoUrl;
        cleanActivities.push({
          id: evt.id,
          type: 'IssuesEvent',
          typeLabel: 'Issue',
          icon: '⚠️',
          count: 1,
          date: dateStr,
          timestamp: evt.created_at,
          repository: repoName,
          repoUrl,
          message: `${action.toUpperCase()}: ${issueTitle}`,
          url: issueUrl
        });
      } else if (evt.type === 'PullRequestReviewEvent') {
        const prUrl = evt.payload && evt.payload.pull_request ? evt.payload.pull_request.html_url : repoUrl;
        cleanActivities.push({
          id: evt.id,
          type: 'PullRequestReviewEvent',
          typeLabel: 'Code Review',
          icon: '👁️',
          count: 1,
          date: dateStr,
          timestamp: evt.created_at,
          repository: repoName,
          repoUrl,
          message: 'Reviewed pull request',
          url: prUrl
        });
      }
    });

    return res.status(200).json({ success: true, activities: cleanActivities });
  } catch (err) {
    console.error('Error in /api/github/activity:', err);
    return res.status(500).json({ error: 'server_error', message: 'Unable to retrieve GitHub activity.' });
  }
};
