const crypto = require('crypto');

function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return { token, hashed, expires };
}

module.exports = {
  generatePasswordResetToken
};