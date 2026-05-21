import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  connection_string: process.env.CONNECTIONSTRING as string,
  port: process.env.PORT,
  secret: process.env.JWT_ACCESS_SECRETE,
  refresh_secret: process.env.JWT_REFRESH_SECRETE,
};

export default config;