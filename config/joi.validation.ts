import * as Joi from "joi";

export const JoiValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  API_PORT: Joi.number().default(3003),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME_HOURS: Joi.string().default("24"),
  COOKIE_SECURE_FLAG: Joi.string().default("false"),
  FRONTEND_URL: Joi.string().required(),

  MYSQL_DB_NAME: Joi.string().required(),
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().default(3306),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_TIMEZONE: Joi.string().default("Europe/Madrid"),

  BASE_POINTS: Joi.number().default(1),
  DAYS_STAT_LIMIT: Joi.number().default(12),
  WEEKS_STAT_LIMIT: Joi.number().default(12),
  MONTHS_STAT_LIMIT: Joi.number().default(12),
});
