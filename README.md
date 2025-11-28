#  Library Management API

A comprehensive API for managing a book library, built with Node.js, Express, and SQLite.

## ✨ Features

- **Authentication:** JWT-based authentication (access & refresh tokens).
- **Role-Based Access Control (RBAC):** `admin`, `librarian`, and `member` roles with different permissions.
- **Book Management:** Full CRUD operations for books, including cover image uploads.
- **Search & Discovery:** Filter books by genre, or full-text search by title, author, and description. Paginate and sort results.
- **Reviews & Ratings:** Members can add, update, and delete their own reviews for books.
- **Borrowing System:**
    - Members can borrow and return books.
    - Enforces a borrow limit per user.
    - Automatic overdue detection via a daily cron job.
    - Automatic fine calculation for overdue books.
- **Waitlist:** If a book is unavailable, members can join a waitlist and get an email notification when it's back in stock.
- **Recommendations:** Logged-in users can get personalized book recommendations.
- **Admin Tools:**
    - Dashboard with key statistics.
    - Bulk import/export of books via CSV.
    - View lists of top borrowed and overdue books.
- **Email Notifications:** Automatic emails for borrow confirmations, overdue reminders, and waitlist availability.
- **API Documentation:** Interactive API documentation powered by Swagger/OpenAPI.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14 or higher)
- npm

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Library-Management-API.git
    cd Library-Management-API
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and fill in the required values:
    ```env
    # Server Configuration
    PORT=3000

    # JWT Configuration
    JWT_SECRET=your_super_secret_jwt_key
    JWT_EXPIRES_IN=15m
    JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key
    JWT_REFRESH_EXPIRES_IN=7d

    # Database Configuration
    DB_PATH=./library.db

    # Email Configuration (using Mailtrap for development)
    EMAIL_HOST=smtp.mailtrap.io
    EMAIL_PORT=2525
    EMAIL_USER=your_mailtrap_user
    EMAIL_PASS=your_mailtrap_pass
    EMAIL_FROM="Library API <no-reply@library.com>"
    ```

### Running the Application

-   **Development Mode:**
    This command starts the server with `nodemon`, which automatically restarts the application on file changes.
    ```bash
    npm run dev
    ```
-   **Production Mode:**
    This command starts the server in production mode.
    ```bash
    npm start
    ```

The server will be running at `http://localhost:3000`.

---

## 📚 API Documentation

Once the server is running, you can access the interactive Swagger API documentation at:

**`http://localhost:3000/api-docs`**

This UI provides detailed information about all available endpoints, their parameters, and expected responses. You can also use it to send requests directly to the API.

---

## 🗂️ Project Structure

```
/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models/abstractions
│   ├── routes/         # API routes
│   ├── services/       # Business logic services (e.g., email)
│   ├── utils/          # Utility functions
│   ├── jobs/           # Cron jobs
│   ├── config/         # Configuration files (db, swagger)
│   ├── app.js          # Main Express app setup
│   └── server.js       # Server entry point
├── migrations/         # Database migration files
├── uploads/            # Directory for file uploads
├── .env                # Environment variables
├── package.json
└── README.md
```
