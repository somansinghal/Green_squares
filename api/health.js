module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  return res.status(200).json({
    status: 'ok',
    githubApi: 'connected',
    rateLimit: 'available',
    mode: 'V2-hybrid',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
};
