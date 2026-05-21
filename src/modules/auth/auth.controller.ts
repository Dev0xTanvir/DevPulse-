import type { Request, Response } from "express";
import { authservice } from "./auth.service";
import sendResponse from "../../utlity/sendResponce";

// singup

const createsingup = async (req: Request, res: Response) => {
  try {
    const result = await authservice.singupuserIntodb(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User Created successfully!",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

// login

const createlogin = async (req: Request, res: Response) => {
  //const result = authservice.loginuserIntodb()
  console.log("hi");
};

export const authcontroller = {
  createsingup,
  createlogin,
};
