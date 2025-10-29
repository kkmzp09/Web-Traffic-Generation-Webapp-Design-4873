// add-keyword-tracker-routes.js
// Script to add keyword tracker routes to existing server.js

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

// Check if server.js exists
if (!fs.existsSync(serverPath)) {
  console.log('❌ server.js not found. Creating route registration code...');
  console.log('\nAdd this code to your server.js:\n');
  console.log(`
// Keyword Tracker API
const keywordTrackerAPI = require('./keyword-tracker-api');
app.use('/api/seo', keywordTrackerAPI);
console.log('✅ Keyword Tracker routes initialized');
  `);
  process.exit(0);
}

// Read server.js
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Check if already added
if (serverContent.includes('keyword-tracker-api')) {
  console.log('✅ Keyword Tracker routes already registered!');
  process.exit(0);
}

// Find a good place to add the routes (after other API routes)
const insertMarker = "// Widget API routes";
const insertPosition = serverContent.indexOf(insertMarker);

if (insertPosition === -1) {
  console.log('⚠️  Could not find insertion point. Please add manually:');
  console.log(`
// Keyword Tracker API
const keywordTrackerAPI = require('./keyword-tracker-api');
app.use('/api/seo', keywordTrackerAPI);
console.log('✅ Keyword Tracker routes initialized');
  `);
  process.exit(0);
}

// Insert the new routes
const newRoutes = `
// Keyword Tracker API
const keywordTrackerAPI = require('./keyword-tracker-api');
app.use('/api/seo', keywordTrackerAPI);
console.log('✅ Keyword Tracker routes initialized');

`;

serverContent = serverContent.slice(0, insertPosition) + newRoutes + serverContent.slice(insertPosition);

// Write back
fs.writeFileSync(serverPath, serverContent, 'utf8');

console.log('✅ Keyword Tracker routes added to server.js successfully!');
console.log('🔄 Restart the server with: pm2 restart relay-api');
