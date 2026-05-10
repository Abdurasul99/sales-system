require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 4000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sales_system',
    SECRET_OR_KEY: process.env.JWT_SECRET || 'dev-secret-replace-me',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};
