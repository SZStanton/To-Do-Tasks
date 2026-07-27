// Reject requests if email does not end with '@gmail.com' - responds with HTTP 403
function gmailOnly(req, res, next) {
  const username = req.user?.username || '';

  if (!username.endsWith('@gmail.com')) {
    return res.status(403).json({
      message: 'Access forbidden: your username must end with @gmail.com.',
    });
  }
  next();
}

export default gmailOnly;
