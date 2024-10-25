export const envConfig = () => ({
  environment: process.env.NODE_ENV,
  port: process.env.API_PORT,
  frontEndUrl: process.env.FRONTEND_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRATION_TIME_HOURS) * 60 * 60,
  jwtExpiresInHours: process.env.JWT_EXPIRATION_TIME_HOURS,
  cookieSecureFlag: process.env.COOKIE_SECURE_FLAG.toLowerCase() === "true",

  mysqlDbName: process.env.MYSQL_DB_NAME,
  mysqlHost: process.env.MYSQL_HOST,
  mysqlPort: +process.env.MYSQL_PORT,
  mysqlUser: process.env.MYSQL_USER,
  mysqlPassword: process.env.MYSQL_PASSWORD,
  mysqlTimezone: process.env.MYSQL_TIMEZONE,
  mysqlSync: process.env.MYSQL_SYNC.toLowerCase() === "true",

  daysStatLimit: process.env.DAYS_STAT_LIMIT,
  weeksStatLimit: process.env.WEEKS_STAT_LIMIT,
  monthsStatLimit: process.env.MONTHS_STAT_LIMIT,
});
