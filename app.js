const express = require('express');
const mustacheExpress = require('mustache-express');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Ensure the database directory exists
const fs = require('fs');
const path = require('path');
const dbDir = path.join(__dirname, 'database');

if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir, { recursive: true });
}


//import routes
const publicRoutes = require('./routes/publicRoutes.js'); 
const studentRoutes = require('./routes/studentRoutes.js'); 
const adminRoutes = require('./routes/adminRoutes.js'); 

const mentorRoutes = require('./routes/mentorRoutes.js'); 
// Create the Express application
const app = express();
const port = process.env.PORT || 3000;

// Set up Mustache as the view engine for Express
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');


// Middleware for cookie parsing
app.use(cookieParser());

// Middleware for body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Define your routes here
// Use the defined routes
app.use('/', publicRoutes);
app.use('/', studentRoutes);
app.use('/', adminRoutes);
app.use('/', mentorRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

