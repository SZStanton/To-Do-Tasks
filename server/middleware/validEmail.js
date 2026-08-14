import { z } from 'zod';

// The logged-in account must still have a valid email. Registration already
// enforces this, so in practice it catches old or hand-edited records
function validEmail(req, res, next) {
  const email = req.user?.email || '';

  if (!z.email().safeParse(email).success) {
    return res.status(403).json({
      message: 'Access forbidden: your account needs a valid email address.',
    });
  }
  next();
}

export default validEmail;
