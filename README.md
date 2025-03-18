# Budget Buddy

A full-stack budget tracking application built with Node.js, Express, PostgreSQL, React, and Tailwind CSS.

## Features

- User authentication and authorization
- Expense tracking and categorization
- Budget management
- Financial goal setting
- Dashboard with spending insights
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/budget-buddy.git
   cd budget-buddy
   ```

2. Run the setup script:
   ```
   npm run setup
   ```
   This will:
   - Create a .env file with default values
   - Install all dependencies
   - Set up the PostgreSQL database
   - Initialize the database with schema and default categories

3. Fix Tailwind CSS configuration (if needed):
   ```
   npm run fix-tailwind
   ```

4. Start the application:
   ```
   npm run dev-full
   ```
   This will start both the backend server and the React frontend.

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Manual Setup (if the setup script fails)

1. Create a `.env` file in the root directory with the following content:
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=budget_buddy
   DB_PASSWORD=your_password
   DB_PORT=5432
   ```

2. Install dependencies:
   ```
   npm install
   cd frontend
   npm install
   npm install tailwindcss postcss autoprefixer @tailwindcss/forms
   cd ..
   ```

3. Set up the database:
   ```
   npm run setup-db
   ```

4. Initialize the database:
   ```
   npm run init-db
   ```

5. Fix Tailwind CSS configuration:
   ```
   npm run fix-tailwind
   ```

6. Start the application:
   ```
   npm run dev-full
   ```

## Environment Variables

### Backend Environment Variables (.env in root directory)

The backend server requires the following environment variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development
SERVE_CLIENT=true

# Database Configuration
# You can use either DATABASE_URL or individual parameters
# DATABASE_URL takes precedence if both are provided
# DATABASE_URL=postgresql://username:password@localhost:5432/BudgetBuddy

# Individual database parameters
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=BudgetBuddy

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h
```

### Frontend Environment Variables (.env in frontend directory)

The frontend application uses these environment variables:

```
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000
REACT_APP_API_MOCK=false

# GitHub Pages Configuration
REACT_APP_GITHUB_API_URL=https://your-backend-api.com
REACT_APP_GITHUB_USE_MOCK=true
REACT_APP_GITHUB_DEMO_MODE=true

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_ERROR_REPORTING=true

# Auth Configuration
REACT_APP_AUTH_STORAGE_KEY=budget_buddy_auth
REACT_APP_SESSION_TIMEOUT=3600000

# Development Server
PORT=3001
```

## GitHub Pages Deployment

This application is configured for deployment to GitHub Pages. The configuration automatically detects when the app is running on GitHub Pages and adjusts settings accordingly.

### GitHub Pages Configuration

When running on GitHub Pages:

1. The app will use the `REACT_APP_GITHUB_API_URL` as the backend API URL
2. If no backend is available, it will run in mock mode (`REACT_APP_GITHUB_USE_MOCK=true`)
3. Demo mode is enabled by default to show sample data

### Testing GitHub Pages Locally

To test GitHub Pages configuration locally:

1. Add `?gh-pages=true` to your local development URL (e.g., `http://localhost:3001?gh-pages=true`)
2. This will simulate GitHub Pages environment with mock data and demo mode

### Deploying to GitHub Pages

To deploy the application to GitHub Pages:

1. Update the `BASE_URL` in `frontend/src/config.js` to match your GitHub repository name
2. Run the deploy script: `npm run deploy-gh-pages` or use the `deploy-gh-pages.bat` script on Windows

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth` - Get current user

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/expenses/summary` - Get expense summary by category

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get budget by ID
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget
- `GET /api/budgets/vs-actual` - Get budget vs actual spending

### Goals
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get goal by ID
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/:id` - Update a goal
- `DELETE /api/goals/:id` - Delete a goal
- `PATCH /api/goals/:id/progress` - Update goal progress

## License

MIT 