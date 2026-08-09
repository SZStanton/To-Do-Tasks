// Reject addition/update of tasks if title exceeds 140 characters
function taskLength(req, res, next) {
  const title = req.body?.title || '';

  if (title.length > 140) {
    return res.status(400).json({
      message: `Task title must not exceed 140 characters (currently ${title.length}).`,
    });
  }
  next();
}

export default taskLength;
