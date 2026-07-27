// Reject requests that are not of the JSON content type, Applied to POST and PUT requests
function jsonOnly(req, res, next) {
  const contentType = req.headers['content-type'] || '';

  if (!contentType.includes('application/json')) {
    return res.status(415).json({
      message: 'Unsupported Media Type: Content-Type must be application/json.',
    });
  }
  next();
}

export default jsonOnly;
