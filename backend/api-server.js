const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const config = require('./config/key');
const db = require('./database/dbconnection');
const Utils = require('./service/utils');

const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const salesRouter = require('./routes/sales');
const customersRouter = require('./routes/customers');
const suppliersRouter = require('./routes/suppliers');
const purchasesRouter = require('./routes/purchases');
const expensesRouter = require('./routes/expenses');
const incomeRouter = require('./routes/income');
const analyticsRouter = require('./routes/analytics');
const shiftsRouter = require('./routes/shifts');
const currencyRouter = require('./routes/currency');
const aiRouter = require('./routes/ai');
const searchRouter = require('./routes/search');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

app.get('/health', (_req, res) => res.status(200).json(Utils.envelope({ body: { ok: true } })));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/income', incomeRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/currency', currencyRouter);
app.use('/api/ai', aiRouter);
app.use('/api/search', searchRouter);

app.use((req, res) => {
    res.status(404).json(Utils.envelope({
        code: '8404',
        message: 'route not found',
        additionalMessage: `${req.method} ${req.originalUrl}`,
    }));
});

const port = config.PORT;
let server;

(async () => {
    await db.connect();

    server = app.listen(port, () => {
        console.log('----------------------------------------------------------');
        console.log(`  🌐 Sales System Backend started on port ${port}`);
        console.log('----------------------------------------------------------');
    });
})();

const shutdown = async (signal) => {
    console.log(`${signal} received — server stopping...`);
    if (server) {
        server.close(() => {
            console.log('Express server stopped successfully.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
