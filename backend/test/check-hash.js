const bcrypt = require('bcrypt');
bcrypt.hash('password123', 12).then(console.log);