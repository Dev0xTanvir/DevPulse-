//DevPulse API

A secure and scalable backend API for managing software project issues, bug reports, and feature requests. Built with Node.js, Express.js, TypeScript, and PostgreSQL.

//VERCEL Live URL

https://devpulse-three-chi.vercel.app/

//GitHub Repository

https://github.com/Dev0xTanvir/DevPulse-.git

//Features

User Registration & Login
JWT Authentication & Authorization
Role-based Access Control
Create Issues
Get All Issues with Filtering & Sorting
Get Single Issue Details
Update Issues
Delete Issues
Password Hashing using bcrypt
PostgreSQL Database Integration
Modular Architecture
Global Error Handling
Environment Variable Configuration

//Tech Stack

//Backend

Node.js
Express.js
TypeScript

//Database

PostgreSQL
pg package

//Authentication & Security

bcrypt
jsonwebtoken

//Deployment

Vercel

//Database

//NeonDB

Setup steps

npm init -y
npm install express pg bcrypt jsonwebtoken dotenv cors
npm install -D typescript ts-node-dev @types/node @types/express @types/bcrypt @types/jsonwebtoken
npx tsc --init

API endpoint list

API Endpoint List (DevPulse)

Auth Module

1. User Signup
   POST /api/auth/signup
2. User Login
   POST /api/auth/login

Issues Module 

3. Create Issue
POST /api/issues 
4. Get All Issues
GET /api/issues?sort=newest&type=bug&status=open 
5. Get Single Issue
GET /api/issues/:id 
6. Update Issue
PATCH /api/issues/:id 
7. Delete Issue
DELETE /api/issues/:id

Database Table Summary

users table

Field	Type / Rule
id	Auto-increment primary key
name	VARCHAR, required
email	VARCHAR, unique, required
password	TEXT, hashed, required
role	contributor / maintainer (default: contributor)
created_at	TIMESTAMP default now()
updated_at	TIMESTAMP auto update

issues table


Field	Type / Rule
id	Auto-increment primary key
title	VARCHAR(150), required
description	TEXT, min 20 chars
type	bug / feature_request
status	open / in_progress / resolved (default: open)
reporter_id	INT (from JWT, no FK required)
created_at	TIMESTAMP default now()
updated_at	TIMESTAMP auto update
