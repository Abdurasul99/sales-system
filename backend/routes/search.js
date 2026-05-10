const router = require('express').Router();
const ctrl = require('../controllers/search.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/', verifyToken, ctrl.global);

module.exports = router;
