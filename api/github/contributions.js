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

  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedYear = parseInt(url.searchParams.get('year'), 10) || new Date().getFullYear();

  const fromDate = `${requestedYear}-01-01T00:00:00Z`;
  const toDate = `${requestedYear}-12-31T23:59:59Z`;

  const graphqlQuery = JSON.stringify({
    query: `
      query($from: DateTime!, $to: DateTime!) {
        viewer {
          login
          contributionsCollection(from: $from, to: $to) {
            hasAnyContributions
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalPullRequestReviewContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                  contributionLevel
                  weekday
                }
              }
            }
            commitContributionsByRepository(maxRepositories: 10) {
              repository {
                name
                url
              }
              contributions {
                totalCount
              }
            }
          }
        }
      }
    `,
    variables: {
      from: fromDate,
      to: toDate
    }
  });

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/graphql',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GitHub-Green-Squares-V2',
      'Content-Length': Buffer.byteLength(graphqlQuery)
    }
  };

  const makeGraphqlRequest = () => new Promise((resolve, reject) => {
    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        resolve({ status: apiRes.statusCode, data });
      });
    });
    apiReq.on('error', (err) => reject(err));
    apiReq.write(graphqlQuery);
    apiReq.end();
  });

  try {
    const result = await makeGraphqlRequest();

    if (result.status === 401) {
      return res.status(401).json({ error: 'session_expired', message: 'GitHub session expired. Please reconnect.' });
    }

    if (result.status === 403) {
      return res.status(403).json({ error: 'rate_limited', message: 'GitHub API rate limit reached. Please try again later.' });
    }

    const json = JSON.parse(result.data);

    if (json.errors && json.errors.length > 0) {
      return res.status(500).json({ error: 'graphql_error', message: json.errors[0].message });
    }

    const viewer = json.data && json.data.viewer;
    if (!viewer) {
      return res.status(500).json({ error: 'invalid_response', message: 'No viewer data in GitHub response.' });
    }

    const collection = viewer.contributionsCollection;
    const calendar = collection.contributionCalendar;

    const daysMap = {};
    const topRepos = (collection.commitContributionsByRepository || []).map((item) => ({
      name: item.repository.name,
      url: item.repository.url,
      contributions: item.contributions.totalCount
    }));

    const primaryRepoName = topRepos.length > 0 ? topRepos[0].name : 'GitHub Activity';

    // Map all days
    (calendar.weeks || []).forEach((week) => {
      (week.contributionDays || []).forEach((day) => {
        const count = day.contributionCount || 0;
        // In GitHub API, contributionDay gives overall count.
        // We approximate breakdown proportionally if detailed per-day event breakdown isn't given.
        const commits = count > 0 ? Math.max(1, Math.round(count * 0.75)) : 0;
        const remaining = count - commits;
        const prs = remaining > 0 ? Math.ceil(remaining / 2) : 0;
        const issues = remaining - prs > 0 ? remaining - prs : 0;
        const reviews = 0;

        daysMap[day.date] = {
          date: day.date,
          total: count,
          commits,
          pullRequests: prs,
          issues,
          codeReviews: reviews,
          repositories: count > 0 ? [primaryRepoName] : [],
          primaryRepo: primaryRepoName,
          note: count > 0 ? `GitHub contribution on ${day.date}` : ''
        };
      });
    });

    return res.status(200).json({
      success: true,
      username: viewer.login,
      year: requestedYear,
      totalContributions: calendar.totalContributions,
      totalCommits: collection.totalCommitContributions,
      totalPRs: collection.totalPullRequestContributions,
      totalIssues: collection.totalIssueContributions,
      totalReviews: collection.totalPullRequestReviewContributions,
      topRepositories: topRepos,
      days: daysMap
    });
  } catch (err) {
    console.error('Error in /api/github/contributions:', err);
    return res.status(500).json({ error: 'server_error', message: 'Unable to retrieve GitHub contributions.' });
  }
};
