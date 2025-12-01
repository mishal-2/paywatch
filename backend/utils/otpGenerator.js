const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
exports.generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate a secure random token
 * @param {number} length - Length of the token
 * @returns {string} Random token
 */
exports.generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
