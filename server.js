import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './utils/errorHandler.js';
import process from 'process';
import { initializeDatabase } from './config/db.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Define Routes
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import expenseRoutes from './routes/expenses.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import incomeRoutes from './routes/income.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Database health check
    const { checkHealth } = await import('./config/db.js');
    const dbHealth = await checkHealth();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'BudgetBuddy API',
      environment: process.env.NODE_ENV,
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/income', incomeRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Set port
const PORT = process.env.PORT || 5000;

// Initialize database then start server
const startServer = async () => {
  try {
    // Initialize database connection
    console.log('Initializing database connection...');
    const dbInitialized = await initializeDatabase();
    
    if (dbInitialized) {
      // Start server after successful database initialization
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🔗 API URL: http://localhost:${PORT}/api`);
        console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('👨‍💻 Running in development mode');
        } else if (process.env.NODE_ENV === 'production') {
          console.log('🚀 Running in production mode');
        }
      });
    } else {
      console.warn('⚠️ Server started with database connection issues');
      console.warn('Some API endpoints may not function correctly');
      
      // Start server anyway to allow health checks and non-database routes
      app.listen(PORT, () => {
        console.log(`⚠️ Server running with limited functionality on port ${PORT}`);
        console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
