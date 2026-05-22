import type { Query } from "pg";
import { pool } from "../../../database/db";
import type { iIssue } from "./issue.interface";

// createservice

const createservice = async (payload: iIssue, reporter_id: number) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `
        INSERT INTO issues (title,description,type,reporter_id)
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
    [title, description, type, reporter_id],
  );

  return result.rows[0];
};

// get service

const getallservice = async (query:any) => {
  const { sort = "newest", type, status } = query;

  

  
};


export const issueservice = {
  createservice,
  getallservice,
};
