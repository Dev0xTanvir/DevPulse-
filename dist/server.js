

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import cookieParser from "cookie-parser";
import express from "express";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";

// src/database/db.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.SECRETE,
  expire: process.env.EXPIRE
};
var config_default = config;

// src/database/db.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        email VARCHAR(30) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
        `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL
    CHECK (LENGTH(description) >= 20),
    type VARCHAR(20) NOT NULL
    CHECK (type IN ('bug', 'feature_request')),
    status VARCHAR(20) DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved')),
    reporter_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
        `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
var singupuserIntodb = async (paylod) => {
  const { name, email, password, role } = paylod;
  if (!name || !email || !password || !role) {
    throw new Error("All fields are required");
  }
  if (role !== "contributor" && role !== "maintainer") {
    throw new Error("Invalid role");
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const singupdata = await pool.query(
    `
      INSERT INTO users(name,email,password,role)
      VALUES ($1,$2,$3,$4)
      RETURNING id,name,email,role,created_at,updated_at
    `,
    [name, email, hashedPassword, role]
  );
  if (singupdata.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  return singupdata.rows[0];
};
var loginuserIntodb = async (playlod) => {
  const { email, password } = playlod;
  const singindata = await pool.query(
    `
    SELECT id,name,email,password,role,created_at,updated_at FROM users
    WHERE email=$1
    `,
    [email]
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
    role: user.role
  };
  const token = jwt.sign(jwtPaylod, config_default.secret, {
    expiresIn: "1d"
  });
  const { password: pass, ...userdata } = user;
  return { token, user: userdata };
};
var authservice = {
  singupuserIntodb,
  loginuserIntodb
};

// src/utlity/sendResponce.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponce_default = sendResponse;

// src/modules/auth/auth.controller.ts
var createsingup = async (req, res) => {
  try {
    const result = await authservice.singupuserIntodb(req.body);
    sendResponce_default(res, {
      statusCode: 201,
      success: true,
      message: "User Created successfully!",
      data: result
    });
  } catch (error) {
    sendResponce_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var createlogin = async (req, res) => {
  try {
    const result = await authservice.loginuserIntodb(req.body);
    sendResponce_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successfully!",
      data: result
    });
  } catch (error) {
    sendResponce_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authcontroller = {
  createsingup,
  createlogin
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authcontroller.createsingup);
router.post("/login", authcontroller.createlogin);
var authRoute = router;

// src/modules/auth/Issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/Issues/issue.service.ts
var createservice = async (payload, reporter_id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues (title,description,type,reporter_id)
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
    [title, description, type, reporter_id]
  );
  return result.rows[0];
};
var getallservice = async (query) => {
  const { sort = "newest", type, status } = query;
  let data = `SELECT * FROM issues WHERE 1=1`;
  const value = [];
  if (type) {
    value.push(type);
    data += ` AND type=$${value.length}`;
  }
  if (status) {
    value.push(status);
    data += ` AND status=$${value.length}`;
  }
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
        [issue.reporter_id]
      );
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporter.rows[0],
        created_at: issue.created_at,
        updated_at: issue.updated_at
      };
    })
  );
  return finaldata;
};
var getsingleservice = async (id) => {
  const result = await pool.query(
    `
             SELECT  *  FROM issues WHERE id=$1
        `,
    [id]
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
    [issue.reporter_id]
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
    updated_at: issue.updated_at
  };
};
var updateservice = async (id, payelod, user) => {
  const result = await pool.query(
    `
             SELECT  *  FROM issues WHERE id=$1
        `,
    [id]
  );
  const issue = result.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("You can update only your own issue");
    }
  }
  if (issue.status !== "open") {
    throw new Error("You cannot update resolved/in_progress issue");
  }
  const { title, description, type } = payelod;
  const updateissue2 = await pool.query(
    `
        UPDATE issues
      SET title=$1,description=$2,type=$3,
      updated_at=NOW() 
      WHERE  id=$4
      RETURNING *
    `,
    [title, description, type, id]
  );
  return updateissue2.rows[0];
};
var deleteservice = async (id) => {
  const result = await pool.query(
    `
             SELECT  FROM issues WHERE id=$1
        `,
    [id]
  );
  const issue = result.rows[0];
  if (!issue) {
    throw new Error("issue not found");
  }
  const deleteissue2 = await pool.query(
    `
    DELETE  FROM issues WHERE id=$1
    `,
    [id]
  );
  return deleteissue2.rows[0];
};
var issueservice = {
  createservice,
  getallservice,
  getsingleservice,
  updateservice,
  deleteservice
};

// src/modules/auth/Issues/issue.controller.ts
var creatissue = async (req, res) => {
  try {
    const reporter_id = req.user.id;
    const result = await issueservice.createservice(req.body, reporter_id);
    sendResponce_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully!",
      data: result
    });
  } catch (error) {
    sendResponce_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getallissue = async (req, res) => {
  try {
    const result = await issueservice.getallservice(req.query);
    sendResponce_default(res, {
      statusCode: 201,
      success: true,
      message: "getall issues successfully!",
      data: result
    });
  } catch (error) {
    sendResponce_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getsingleissue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueservice.getsingleservice(id);
    sendResponce_default(res, {
      statusCode: 200,
      success: true,
      message: "getsingle issues successfully!",
      data: result
    });
  } catch (error) {
    sendResponce_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateissue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueservice.updateservice(
      id,
      req.body,
      req.user
    );
    sendResponce_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    sendResponce_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteissue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueservice.deleteservice(id);
    sendResponce_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue delete successfully",
      data: result
    });
  } catch (error) {
    sendResponce_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issuecontroller = {
  creatissue,
  getallissue,
  getsingleissue,
  updateissue,
  deleteissue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponce_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt2.verify(
        token,
        config_default.secret
      );
      const userdata = await pool.query(
        `
            SELECT  *  FROM users WHERE id=$1
        `,
        [decoded.id]
      );
      const user = userdata.rows[0];
      if (userdata.rows.length === 0) {
        return sendResponce_default(res, {
          statusCode: 404,
          success: false,
          message: "user not found!!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return sendResponce_default(res, {
          statusCode: 403,
          success: false,
          message: "user forbiden!!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return sendResponce_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    }
  };
};
var auth_default = auth;

// src/modules/auth/Issues/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default("contributor", "maintainer"), issuecontroller.creatissue);
router2.get("/", issuecontroller.getallissue);
router2.get("/:id", issuecontroller.getsingleissue);
router2.patch(
  "/:id",
  auth_default("contributor", "maintainer"),
  issuecontroller.updateissue
);
router2.delete("/:id", auth_default("maintainer"), issuecontroller.deleteissue);
var issueRoute = router2;

// src/app.ts
var app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use("/api/issues", issueRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//! check user role
//# sourceMappingURL=server.js.map