const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const {adminAuth} = require('../middlewares/auth');

router.get('/pageNotFound',adminController.pageNotFound);
router.get('/login',adminController.loadLogin);
router.post('/login',adminController.login);
router.get('/',adminAuth,adminController.loadDashboard);


module.exports = router;