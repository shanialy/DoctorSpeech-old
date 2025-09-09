const dotenv = require('dotenv');
const path = require('path');

// Load environment-specific .env file
const env = process.env.NODE_ENV || 'development'; // 'development' is default

// Adjust the path to the root directory where your .env files are located
const result = dotenv.config({ path: path.resolve(__dirname, '../../../.env.' + env) });

// Check if there's an error loading the environment variables
if (result.error) {
  console.error(`Failed to load .env.${env} file:`, result.error);
} else {
  console.log(`Loaded environment configuration for: ${env}`);
}

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT || 3000,
  SERVER_URL: process.env.SERVER_URL,
};
