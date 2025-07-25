const express = require('express');
const router = express.Router();

const upload = require('../config/multer');

const adminController = require('../controllers/adminController');
const customerController = require('../controllers/customerController');
const categoryController = require('../controllers/categeoryController');
const productController = require('../controllers/productController');
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

router.get('/products',adminAuth,productController.productInfo);
router.get('/addProduct',adminAuth,productController.loadAddProduct);
router.post('/addProduct', upload.array('productImage', 5), productController.addProduct);
router.get('/editProduct/:id',adminAuth,productController.loadEditProduct);
router.post('/editProduct/:id', upload.array('productImage', 5), productController.editProduct);
router.get('/deleteProduct/:id',adminAuth,productController.deleteProduct);

module.exports = router;