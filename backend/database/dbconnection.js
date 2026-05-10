const mongoose = require('mongoose');
const config = require('../config/key');

mongoose.set('strictQuery', true);

async function connect() {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});

module.exports = {
    connect,
    connection: mongoose.connection,
};
