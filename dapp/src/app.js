const start = require('./r3v3al');

start().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
