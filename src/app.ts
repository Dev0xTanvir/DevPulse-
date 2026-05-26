import cookieParser from "cookie-parser";
import express, { type Application } from "express";

import globalErrorHandler from "./middleware/globalErrorHandler";
import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/auth/Issues/issue.route";
const app: Application = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/api/issues", issueRoute);

app.use("/api/auth", authRoute);

// Global Error Handling Middleware

app.use(globalErrorHandler);

export default app;
