const express = require('express');
const { PORT } = require('./src/services/env/config');
const { connectToDatabase } = require('./src/services/db/config');

const authRoutes = require('./src/routers/auth_routes');
const therapyRoutes = require('./src/routers/therapy_routes');
const taskRoutes = require('./src/routers/task_routes');
const therapyPlanRoutes = require('./src/routers/therapy_plan_routes');
const availabilityRoutes = require('./src/routers/availability_routes');
const appointmentRoutes = require('./src/routers/appointment_routes');
const stripeTestingRoutes = require('./src/routers/test_routes');
const User = require('./src/models/user');

const app = express();

// Middleware
app.use(express.json());

// Connect to database
connectToDatabase();

// Routes
app.use('/api/auth', authRoutes);   // Authentication routes
app.use('/api', therapyRoutes, taskRoutes, therapyPlanRoutes, availabilityRoutes, appointmentRoutes, stripeTestingRoutes);
app.use('/test', (req, res) => res.send('<h1>Testing server<h1>'));   // Authentication routes

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});
