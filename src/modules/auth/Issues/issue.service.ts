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

// get allservice

const getallservice = async (query: any) => {
  const { sort = "newest", type, status } = query;

  let data = `SELECT * FROM issues WHERE 1=1`;

  const value = [];

  // filter type
  if (type) {
    value.push(type);

    data += ` AND type=$${value.length}`;
  }

  // filter status
  if (status) {
    value.push(status);

    data += ` AND status=$${value.length}`;
  }

  // sorting
  if (sort === "oldest") {
    data += ` ORDER BY created_at ASC`;
  } else {
    data += ` ORDER BY created_at DESC`;
  }

  const result = await pool.query(data, value);

  const finaldata = await Promise.all(
    result.rows.map(async (issue) => {
      const reporter = await pool.query(
        `
        SELECT id,name,role
        FROM users
        WHERE id=$1
        `,
        [issue.reporter_id],
      );

      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,

        reporter: reporter.rows[0],

        created_at: issue.created_at,
        updated_at: issue.updated_at,
      };
    }),
  );

  return finaldata;
};

// get singleservice

const getsingleservice = async (id: string) => {
  const result = await pool.query(
    `
             SELECT  *  FROM issues WHERE id=$1
        `,
    [id],
  );

  const issue = result.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  const reporter = await pool.query(
    `
        SELECT id,name,role
        FROM users
        WHERE id=$1
        `,
    [issue.reporter_id],
  );

  return {
    // ...issue,
    // reporter:reporter.rows[0]
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter: reporter.rows[0],

    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

// update service

const updateservice = async (id: string, payelod: iIssue, user: any) => {
  const result = await pool.query(
    `
             SELECT  *  FROM issues WHERE id=$1
        `,
    [id],
  );

  const issue = result.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  // check permision

  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("You can update only your own issue");
    }
  }

  // check status

  if (issue.status !== "open") {
    throw new Error("You cannot update resolved/in_progress issue");
  }

  // update issues

  const { title, description, type } = payelod;

  const updateissue = await pool.query(
    `
        UPDATE issues
      SET title=$1,description=$2,type=$3,
      updated_at=NOW() 
      WHERE  id=$4
      RETURNING *
    `,
    [title, description, type, id],
  );

  return updateissue.rows[0];
};

// delete service

const deleteservice = async (id: string) => {
  const result = await pool.query(
    `
             SELECT  FROM issues WHERE id=$1
        `,
    [id],
  );

  const issue = result.rows[0];
  if (!issue) {
    throw new Error("issue not found");
  }

  // delete issue

  const deleteissue = await pool.query(
    `
    DELETE  FROM issues WHERE id=$1
    `,
    [id],
  );
  return deleteissue.rows[0];
};

export const issueservice = {
  createservice,
  getallservice,
  getsingleservice,
  updateservice,
  deleteservice,
};
