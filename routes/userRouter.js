const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const passport = require('passport');
const {userAuth} = require('../middlewares/auth');

router.get('/pageNotFound',userController.pageNotFound);
router.get('/',userController.loadHomepage);
router.get('/signup',userController.loadSignup);
router.get('/shop',userController.loadShopping);
router.post('/signup',userController.signup);
router.post('/verifyOtp',userController.verifyOtp);
router.post('/resendOtp',userController.resendOtp);



router.get('/auth/google/signup', (req, res, next) => {
  req.session.googleSignup = true;
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'consent' }));


router.get('/auth/google/login', (req, res, next) => {
  req.session.googleSignup = false;
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'consent' }));


router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/signup?error=Email not found'
  }),
  (req, res) => {
    req.session.user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email
    };
    res.redirect('/');
  }
);


router.get('/login',userController.loadLogin);
router.post('/login',userController.login);
router.get('/logout',userController.logout);


router.get('/profile',userAuth,userController.loadProfile);
router.get('/forgotPassword',userController.forgotPassword);

module.exports = router;