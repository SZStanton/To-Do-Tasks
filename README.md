# To-Do Tasks App

A full-stack MERN application for managing personal tasks, with secure user accounts so each user's task list stays private to them.

The app uses React on the front end and a Node/Express/MongoDB back end secured with JWT authentication.

## Problem

Task lists that anyone can view or edit aren't usable for personal or shared work — data needs to stay private to the account that owns it.

## Impact

Every task is scoped to an authenticated user via protected routes, so tasks stay private and secure without the user having to think about it.

## Features

- User registration and login with hashed password validation
- JWT-based authentication and protected routes
- Create, edit, delete, and complete tasks
- Filter tasks by All / Active / Completed
- Task counter showing tasks remaining

## Tech Stack

**Front end:** React, Context API
**Back end:** Node.js, Express, MongoDB, JWT
**Structure:** Front end organized into components, context, and pages. Back end organized into config, middleware, models, and routes.

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/SZStanton/To-Do-Tasks
   ```

2. Navigate into the project folder

3. Install dependencies for both front end and back end

   ```bash
   npm install
   ```

4. Set up your environment variables (`.env`) with your MongoDB connection string and JWT secret

5. Run the back end

   ```bash
   npm run server
   ```

6. Run the front end

   ```bash
   npm run dev
   ```

7. Open the app in your browser

   ```bash
   http://localhost:5173/
   ```
