require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 4000,
    MONGO_URI: process.env.MONGO_URI,
    SECRET_OR_KEY: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};
