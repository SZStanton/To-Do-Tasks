# To-Do List App

A full-stack MERN task management application featuring secure user authentication, private task storage, and an intuitive interface for managing daily tasks. This project demonstrates a complete MERN stack build with JWT authentication, protected API routes, and persistent data storage — each user has their own private task list.

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

1. Clone the repository

   ```bash
   git clone https://github.com/SZStanton/To-Do-Tasks
   ```

2. Navigate into the project folder and install dependencies for both frontend and backend

   ```bash
   npm install
   ```

3. Set up your environment variables (`.env`) with your MongoDB connection string and JWT secret

4. Run the backend

   ```bash
   npm run server
   ```

5. Run the frontend

   ```bash
   npm run dev
   ```

6. Open the app in your browser

   ```bash
   http://localhost:5173/
   ```

## Future Improvements

- Task due dates and reminders
- Task categories/tags
- Drag-and-drop task reordering
- Dark/light mode toggle
