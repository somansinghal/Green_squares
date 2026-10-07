module.exports = async (req, res) => {
  const isSecure = req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', `gh_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure ? '; Secure' : ''}`);

  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  res.writeHead(302, { Location: '/?logged_out=1' });
  res.end();
};
