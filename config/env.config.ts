export const envConfig = () => ({
  environment: process.env.NODE_ENV,
  port: process.env.API_PORT,
  frontEndUrl: process.env.FRONTEND_URL,

  mysqlDbName: process.env.MYSQL_DB_NAME,
  mysqlHost: process.env.MYSQL_HOST,
  mysqlPort: +process.env.MYSQL_PORT,
  mysqlUser: process.env.MYSQL_USER,
  mysqlPassword: process.env.MYSQL_PASSWORD,
  mysqlTimezone: process.env.MYSQL_TIMEZONE,
  mysqlSync: process.env.MYSQL_SYNC.toLowerCase() === 'true',
});
