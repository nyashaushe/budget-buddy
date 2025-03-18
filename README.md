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

## GitHub Pages Deployment

The frontend of this application is configured for deployment to GitHub Pages, which allows you to showcase the application's UI and functionality without needing to set up a backend server.

### Demo Mode

When deployed to GitHub Pages, the application automatically runs in "demo mode", which:

- Uses mock data instead of making real API calls
- Provides a simulated login/registration experience
- Demonstrates all UI features without a backend

### Deployment Steps

1. Update the `homepage` field in `frontend/package.json` with your GitHub username:
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/budget-buddy"
   ```

2. Deploy manually from your local machine:
   ```
   cd frontend
   npm run deploy
   ```
   This builds the application and pushes it to the `gh-pages` branch of your repository.

3. Alternatively, push to the `main` branch to trigger the GitHub Actions workflow:
   ```
   git push origin main
   ```
   The workflow will automatically build and deploy the application.

4. Your application will be available at:
   ```
   https://YOUR_GITHUB_USERNAME.github.io/budget-buddy
   ```

### Customizing the Demo

You can customize the demo data by modifying the mock data provider:
- Edit `frontend/src/utils/mockDataProvider.js` to add or modify the sample data
- The changes will be reflected in the GitHub Pages demo

### Running Locally in Demo Mode

To test the GitHub Pages version locally:
```
cd frontend
npm start
```
Then add `?demo=true` to the URL, e.g., `http://localhost:3000?demo=true` 