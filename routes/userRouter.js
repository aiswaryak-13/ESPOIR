const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController');
const passport = require('passport');

router.get('/pageNotFound',userController.pageNotFound);
router.get('/',userController.loadHomepage);
router.get('/signup',userController.loadSignup);
router.get('/shop',userController.loadShopping);
router.post('/signup',userController.signup);
router.post('/verifyOtp',userController.verifyOtp);
router.post('/resendOtp',userController.resendOtp);


router.get('/auth/google',passport.authenticate('google',{scope:['profile','email'],
   prompt: 'consent'
}));

router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
  req.session.user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email
  };

  res.redirect('/');
});


router.get('/login',userController.loadLogin);
router.post('/login',userController.login);
router.get('/logout',userController.logout);


router.get('/profile',userController.loadProfile);
router.get('/forgotPassword',userController.forgotPassword);

module.exports = router;