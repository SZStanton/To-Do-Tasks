# To-Do List App

A full-stack MERN task management application featuring secure user authentication, private task storage, and an intuitive interface for managing daily tasks. This project demonstrates a complete MERN stack build with JWT authentication, protected API routes, and persistent data storage, giving each user their own private task list.

## Screenshots

<table>
  <tr>
    <td><img src="screenshots/register.png" width="300" alt="Register page"/></td>
    <td><img src="screenshots/dashboard.png" width="300" alt="Task dashboard"/></td>
    <td><img src="screenshots/add-task.png" width="300" alt="Add task page"/></td>
  </tr>
</table>

## Features

- Secure user registration and login with hashed password validation
- JWT authentication and protected API routes
- Create, edit, complete, and delete tasks
- Filter tasks by All / Active / Completed
- Task counter showing tasks remaining
- Responsive React interface

## Tech Stack

**Frontend:** React, Context API, Vite

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT

## Project Structure

**Frontend:** components, context, pages, App.jsx, main.jsx

**Backend:** config, middleware, models, routes, server.js

## Installation

1. Clone the repository and enter the folder

   ```bash
   git clone https://github.com/SZStanton/To-Do-Tasks
   cd To-Do-Tasks
   ```

2. Install dependencies for the root, the frontend and the backend

   ```bash
   npm install
   npm run setup
   ```

3. Create the environment files from the examples

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. Fill in `server/.env` with your MongoDB connection string and a JWT secret. See
   [Environment variables](#environment-variables) below. Generate a secret with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

5. Start the API and the frontend together

   ```bash
   npm run dev
   ```

6. Open http://localhost:5173 in your browser

## Environment variables

`server/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string, Atlas cluster or local mongod |
| `JWT_SECRET` | yes | Long random string used to sign tokens |
| `PORT` | no | Port the API listens on, defaults to `5000` |
| `CLIENT_URL` | no | Frontend origin for CORS, defaults to `http://localhost:5173` |

`client/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | yes | Base URL of the backend, no trailing slash |

## Scripts

Run these from the project root.

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs the API and the frontend together |
| `npm run dev:server` | API only |
| `npm run dev:client` | Frontend only |
| `npm run setup` | Installs dependencies in `client` and `server` |
| `npm run build` | Production build of the frontend |
| `npm run lint` | Lints the frontend |

## Future Improvements

- Task due dates and reminders
- Task categories/tags
- Drag-and-drop task reordering
- Dark/light mode toggle
