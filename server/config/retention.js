// This is a public demo that collects real email addresses, so nothing is kept
// forever. A user and their tasks always share one expiry date, which is how a
// task can never outlive the account that owns it.

const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_DAYS = 60;

// Sixty days from now, the date both the user and their tasks get
const nextExpiry = () => new Date(Date.now() + RETENTION_DAYS * DAY_MS);

// Only rewrite the date once it has drifted by a day, otherwise every request
// would cost two extra writes. Active accounts cost about one write a day
const needsRefresh = current => !current || nextExpiry() - current > DAY_MS;

export { RETENTION_DAYS, nextExpiry, needsRefresh };
