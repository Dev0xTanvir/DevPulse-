import CookieParser from "cookie-parser";
import express, {
  type Application,
} from "express";

 import globalErrorHandler from "./middleware/globalErrorHandler";
const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));



app.use("/api/issues", );
app.use("/api/auth", );

// Global Error Handling Middleware

app.use(globalErrorHandler);

export default app;