import type { Request, Response } from "express";
import { issueservice } from "./issue.service";
import sendResponse from "../../../utlity/sendResponce";

// create issues

const creatissue = async (req: Request, res: Response) => {
  try {
    const reporter_id = (req as any).user.id;
    const result = await issueservice.createservice(req.body, reporter_id);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully!",
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

// get issues

const getallissue = async (req: Request, res: Response) => {
  try {
    const result = await issueservice.getallservice(req.params);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "get issues successfully!",
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

export const issuecontroller = {
  creatissue,
  getallissue,
};
