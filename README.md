# Tasker — Your Personal Task Sanctuary

**Live demo:** [my-tasker-teal.vercel.app](https://my-tasker-teal.vercel.app)

A full-stack todo task manager with a warm, feminine aesthetic. Built with React, Vite, Tailwind CSS, Node.js, Express, and SQLite.

## Tech Stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Lucide     |
| Backend  | Node.js, Express.js                          |
| Database | SQLite via `better-sqlite3`                  |
| Auth     | JWT (jsonwebtoken) + bcrypt                  |

## Project Structure

```
first website/
├── backend/
│   ├── server.js              # Express entry point
│   ├── src/
│   │   ├── config/database.js # SQLite setup & schema
│   │   ├── middleware/auth.js  # JWT authentication
│   │   └── routes/
│   │       ├── auth.js        # Register / Login
│   │       └── todos.js       # CRUD endpoints
│   ├── data/                  # SQLite database file (auto-created)
│   ├── .env                   # Environment variables
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── NotificationContext.jsx
    │   ├── services/api.js     # Axios API client
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   └── Dashboard.jsx
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── TodoItem.jsx
    │       ├── TodoForm.jsx
    │       ├── Filters.jsx
    │       └── Notification.jsx
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## Setup & Running

### Prerequisites
- Node.js 18+ and npm installed

### 1. Backend

```bash
cd backend
npm install
# Edit .env and change JWT_SECRET to something secure
npm run dev     # development (nodemon)
# or
npm start       # production
```

Backend runs on **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

### 3. Open in browser

Visit [http://localhost:5173](http://localhost:5173), register an account, and start adding tasks!

## API Reference

### Auth
| Method | Endpoint              | Description     |
|--------|-----------------------|-----------------|
| POST   | /api/auth/register    | Register user   |
| POST   | /api/auth/login       | Login user      |

### Todos (JWT required)
| Method | Endpoint                     | Description            |
|--------|------------------------------|------------------------|
| GET    | /api/todos                   | Get all todos          |
| POST   | /api/todos                   | Create todo            |
| GET    | /api/todos/:id               | Get single todo        |
| PUT    | /api/todos/:id               | Update todo            |
| DELETE | /api/todos/:id               | Delete todo            |
| PATCH  | /api/todos/:id/complete      | Toggle completion      |

**Query params for GET /api/todos:** `?status=active|completed&priority=high|medium|low&search=text`

## Features

- JWT authentication (register, login, protected routes)
- Create, read, update, delete tasks
- Toggle task completion with animated checkbox
- Priority levels (High, Medium, Low)
- Optional due dates with overdue/today highlighting
- Search by title, filter by status, priority, and due date
- Stats dashboard with progress bar
- Dark mode toggle (persisted in localStorage)
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and micro-interactions
- Warm, feminine design with soft color palette

## Environment Variables (backend/.env)

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
