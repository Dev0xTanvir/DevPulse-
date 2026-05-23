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

// get allissues

const getallissue = async (req: Request, res: Response) => {
  try {
    const result = await issueservice.getallservice(req.query);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "getall issues successfully!",
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

// get singleissue

const getsingleissue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueservice.getsingleservice(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "getsingle issues successfully!",
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

// update issue

const updateissue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueservice.updateservice(
      id as string,
      req.body,
      req.user,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
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

// delete issue

const deleteissue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueservice.deleteservice(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue delete successfully",
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
  getsingleissue,
  updateissue,
  deleteissue,
};
