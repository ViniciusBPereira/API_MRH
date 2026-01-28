import dotenv from "dotenv";
dotenv.config();

export default {
  PORT: process.env.PORT,
  API_TOKEN: process.env.API_TOKEN,

  // Banco LOCAL
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,

  // Banco CORPORATIVO (VPN)
  CORP_DB_HOST: process.env.CORP_DB_HOST,
  CORP_DB_PORT: process.env.CORP_DB_PORT,
  CORP_DB_USER: process.env.CORP_DB_USER,
  CORP_DB_PASS: process.env.CORP_DB_PASS,
  CORP_DB_NAME: process.env.CORP_DB_NAME,

  REGISTER: process.env.REGISTER,
  JWT_SECRET: process.env.JWT_SECRET,
};
