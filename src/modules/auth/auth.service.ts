import bcrypt from "bcrypt";
import { pool } from "../../database/db";
import type { auth } from "./auth.interface";
import jwt from "jsonwebtoken";
import config from "../../config";

// singup

const singupuserIntodb = async (paylod: auth) => {
  const { name, email, password, role } = paylod;

  //  hash password

  const hashedPassword = await bcrypt.hash(password, 12);

  const singupdata = await pool.query(
    `
      INSERT INTO users(name,email,password,role)
      VALUES ($1,$2,$3,$4)
      RETURNING id,name,email,role,created_at,updated_at
    `,
    [name, email, hashedPassword, role],
  );

  // required fields

  if (!name || !email || !password || !role) {
    throw new Error("All fields are required");
  }

  if (role !== "contributor" && role !== "maintainer") {
    throw new Error("Invalid role");
  }

  if (singupdata.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  return singupdata.rows[0];
};

// singin

const loginuserIntodb = async (playlod: auth) => {
  const { email, password } = playlod;

  const singindata = await pool.query(
    `
    SELECT id,name,email,password,role,created_at,updated_at FROM users
    WHERE email=$1
    `,
    [email],
  );

  const user = singindata.rows[0];

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const inMatch = await bcrypt.compare(password, user.password);
  if (!inMatch) {
    throw new Error("Invalid email or password");
  }

  const jwtPaylod = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(jwtPaylod, config.secret as string, {
    expiresIn: config.expire ,
  });

  const { password: pass, ...userdata } = user;

  return { token, user: userdata };
};

export const authservice = {
  singupuserIntodb,
  loginuserIntodb,
};
