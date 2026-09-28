# TaskTrack

TaskTrack is a full-stack task management application built with React, Vite,
Express, MongoDB, Mongoose, bcrypt, and JWT authentication.

## Features

- User registration with hashed passwords
- JWT-based login and protected task routes
- Create, view, edit, and delete tasks
- Task status and due dates
- Responsive React interface

## Requirements

- Node.js 20.19+ recommended
- npm
- MongoDB Atlas or a local MongoDB instance

## Setup

Clone the repository and install dependencies in both application folders:

```bash
git clone <your-repo-url>
cd devorbis-week1

cd server
npm install

cd ../client
npm install
```

Create `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/tasktrack
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Do not commit either `.env` file. They are ignored by Git. Use different,
strong secrets in deployed environments.

## Run Locally

Start the backend in one terminal:

```bash
cd server
npm start
```

The API runs at `http://localhost:3000`.

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

The Vite development server runs at `http://localhost:5173`.

For a production client build:

```bash
cd client
npm run build
npm run preview
```

## API Documentation

Base URL: `http://localhost:3000`

### Health Check

`GET /`

Returns `{ "message": "TaskTrack API is running" }`.

### Authentication

`POST /api/auth/register`

Request body:

```json
{
  "username": "alex",
  "email": "alex@example.com",
  "password": "A-long-password1!"
}
```

Registration returns a JWT and the public user profile. Passwords are hashed
with bcrypt before storage.

`POST /api/auth/login`

Request body:

```json
{
  "email": "alex@example.com",
  "password": "A-long-password1!"
}
```

Login returns a JWT and the public user profile. Use the token on protected
requests with this header:

```http
Authorization: Bearer <token>
```

### Tasks

All task endpoints require the Bearer token.

| Method | Endpoint         | Description                     |
| ------ | ---------------- | ------------------------------- |
| GET    | `/api/tasks`     | List the signed-in user's tasks |
| GET    | `/api/tasks/:id` | Get one task                    |
| POST   | `/api/tasks`     | Create a task                   |
| PUT    | `/api/tasks/:id` | Update a task                   |
| DELETE | `/api/tasks/:id` | Delete a task                   |

Task request fields:

```json
{
  "title": "Finish project README",
  "description": "Document setup and API usage",
  "status": "todo",
  "dueDate": "2026-10-02"
}
```

Valid status values are `todo`, `in-progress`, and `done`. The authenticated
user is assigned automatically and cannot be changed through the request body.

## Environment Variables

| Variable       | Used by | Description                                           |
| -------------- | ------- | ----------------------------------------------------- |
| `MONGO_URI`    | Server  | MongoDB connection string                             |
| `JWT_SECRET`   | Server  | Secret used to sign and verify JWTs                   |
| `PORT`         | Server  | API port; defaults to `3000`                          |
| `VITE_API_URL` | Client  | Backend base URL; defaults to `http://localhost:3000` |

## Project Structure

```text
client/   React and Vite frontend
server/   Express API, authentication, and MongoDB models
postman/  API collections and request documentation
```
