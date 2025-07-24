const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const customerController = require('../controllers/customerController');
const categoryController = require('../controllers/categeoryController');
const {adminAuth} = require('../middlewares/auth');

router.get('/pageNotFound',adminController.pageNotFound);
router.get('/login',adminController.loadLogin);
router.post('/login',adminController.login);
router.get('/',adminAuth,adminController.loadDashboard);

router.get('/logout',adminController.logout);

router.get('/customers',adminAuth,customerController.customerInfo);

router.get('/blockCustomer',adminAuth,customerController.customerBlocked);
router.get('/unblockCustomer',adminAuth,customerController.customerUnblocked);

router.get('/category',adminAuth,categoryController.categoryInfo);
router.get('/addCategory',adminAuth,categoryController.loadAddCategory);
router.post('/addCategory',adminAuth,categoryController.addCategory);

router.get('/editCategory/:id',adminAuth,categoryController.editCategory);
router.post('/editCategory/:id',adminAuth,categoryController.updateCategory);

router.get('/deleteCategory/:id',adminAuth,categoryController.deleteCategory);

module.exports = router;