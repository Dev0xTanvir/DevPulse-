import type { NextFunction, Request, Response } from "express";
import type { ROLES } from "../types";
import sendResponse from "../utlity/sendResponce";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../database/db";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ! token send authorization headers

      const token = req.headers.authorization;
      if (!token) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!!",
        });
      }

      // ! jwt token decode

      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;

      const userdata = await pool.query(
        `
            SELECT  *  FROM users WHERE email=$1
        `,
        [decoded.email],
      );

      // ! check user from db

      const user = userdata.rows[0];
      if (userdata.rows.length === 0) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "user not found!!",
        });
      }

      //! check user role

      if (roles.length && !roles.includes(user.role)) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "user forbiden!!",
        });
      }

      req.user = decoded;

      next();
    } catch (error: any) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error: error,
      });
    }
  };
};

export default auth;
