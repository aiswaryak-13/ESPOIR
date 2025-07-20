const User = require('../../models/userSchema');
const nodemailer = require('nodemailer');
const env = require('dotenv').config();
const bcrypt = require('bcrypt');




const pageNotFound = async (req,res) => {
  try {
    res.render('user/page_404');
  } catch (error) {
    res.redirect('/pageNotFound');
  }
}



const loadHomepage = async (req, res) => {
  try {
    let userData = null;

    if (req.session.user && req.session.user._id) {
      userData = await User.findById(req.session.user._id).lean();
    }

    res.render('user/home', { user: userData });
  } catch (error) {
    console.error('Home page not found!!', error);
    res.status(500).send('Server error');
  }
};


const loadSignup = async (req,res) => {
  try {
    return res.render('user/signup')
  } catch (error) {
    console.log('Home page not loading', error);
    res.status(500).send('Server Error');
  }
}

const loadShopping = async (req,res) => {
  try {
    return res.render('shop');
  } catch (error) {
    console.log('Shopping page not available', error);
    res.status(500).send('Server error');
  }
}

// const signup = async (req,res) => {
//   //console.log(req.body);
//   const {name,gender,phone,email,password,confirmpassword} = req.body;
//   try {
//     const newUser = new User({name,gender,phone,email,password});
//     await newUser.save();
//     return res.redirect('/signup')
//   } catch (error) {
//     console.error('Error for saving user', error);
//     res.status(500).send('Internal Server error');
//   }
// }

function generateOtp(){
  return Math.floor(1000 + Math.random()*9000).toString();
}

async function sendVerificationEmail(email,otp){
  try {

    const transporter = nodemailer.createTransport({
      service:'gmail',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:process.env.NODEMAILER_EMAIL,
        pass:process.env.NODEMAILER_PASSWORD
      }
    })

    const info = await transporter.sendMail({
      from:process.env.NODEMAILER_EMAIL,
      to:email,
      subject:"Verify your account",
      text:`Your OTP is ${otp}`,
      html:`<b>Your OTP : ${otp}</b>`,

    })

    return info.accepted.length > 0


  } catch (error) {
    
    console.error('Error sending email',error);
    return false;
    
  }
}

const signup = async (req,res) => {
  const {name,gender,phone, email, password, confirmPassword} = req.body;
  try {
    if(password != confirmPassword){
      return res.render('user/signup',{message:"Password do not match"});
    }

    const findUser = await User.findOne({email});
    if(findUser){
      return res.render('user/signup',{message:'User with this email already exists'});
    }

    const otp = generateOtp();

    const emailSent = await sendVerificationEmail(email,otp);

    if(!emailSent){
      return res.json('email-error');
    }

    req.session.userOtp = otp;
    req.session.userData = {name,gender,phone,email,password};

    res.render('user/verifyOtp');
    console.log('OTP sent',otp);
    

  } catch (error) {
    console.error('Signup error',error);
    res.redirect('/pageNotFound');
  }
}


const  SecurePassword = async(password)=>{

try {
  const passwordHash = await bcrypt.hash(password,10);

  return passwordHash;

} catch (error) {
  console.error('Password hashing error:', error);
}

}


const verifyOtp = async (req,res) => {
  
  try {
    const {otp} = req.body;
    console.log(otp);

    if(otp === req.session.userOtp){
      const user = req.session.userData;
      const passwordHash = await SecurePassword(user.password); 

      const saveUserData = new User({
        name:user.name,
        gender:user.gender,
        email:user.email,
        phone:user.phone,
        password:passwordHash,
      })

      await saveUserData.save();
      req.session.user = saveUserData._id;
      //res.json({success:true, redirectUrl:'/login'})
      res.redirect('/login');
    }else{
      res.status(400).json({success:false,message:"Invalid OTP, Try again"});
    }
    
  } catch (error) {
    console.error('Error verifying OTP',error);
    res.status(500).json({success:false,message:"An error occured"});
  }
}


const resendOtp = async (req,res) => {
  try {
    const {email} = req.session.userData;
    if(!email){
      return res.status(400).json({success:false,message:'Email not found'});
    }

    const otp = generateOtp();
    req.session.userOtp = otp;

    const emailSent = await sendVerificationEmail(email,otp);

    if(emailSent){
      console.log('Resend OTP:',otp);
      res.status(200).json({success:true,message:"OTP resend successfully"});
    }else{
      res.status(500).json({success:false,message:'Failed to resend OTP. Try again'})
    }
  } catch (error) {
    console.error('Error resending OTP',error);
    res.status(500).json({success:false,message:'Internal Server Error. Try again'});
  }
}


const loadLogin = async (req,res) => {
  try {
    if(!req.session.user){
      return res.render('user/login');
    }else{
      res.redirect('/');
    }
  } catch (error) {
    res.redirect('/pageNotFound')
  }
}

const login = async (req,res) => {
  try {
    const {email,password} = req.body;

    if (!email || !password) {
      return res.render('user/login', { message: "Email and password are required" });
    }

    const findUser = await User.findOne({isAdmin:0,email:email});

    if(!findUser){
      return res.render('user/login',{message:"User not found"});
    }

    if(findUser.isBlocked){
      return res.render('user/login',{message:"User is blocked by Admin"});
    }

    // if (!findUser.password) {
    //   console.error(`No password hash found for user: ${findUser.email}`);
    //   return res.render('user/login', { message: "Account issue. Contact support." });
    // }

    const passwordMatch = await bcrypt.compare(password,findUser.password);

    if(!passwordMatch){
      return res.render('user/login',{message:"Incorrect password"});
    }

    req.session.user = {
      _id: findUser._id,
      name: findUser.name,
      email: findUser.email,
      // optionally add other properties you need like isBlocked
    };
    res.redirect('/');

  } catch (error) {
    
    console.error('login error',error);
    res.render('user/login',{message:"login failed. Try later"});

  }
}

const logout = async (req,res) => {
  try {
    req.session.destroy((err)=>{
      if(err){
        console.log('Session destruction error',err.message);
        return res.redirect('/pageNotFound');
      }
      return res.redirect('/login');
    })
  } catch (error) {
    console.log('Logout error');
    res.redirect('/pageNotFound');
  }
}


const loadProfile = async (req,res) => {
  try {
    if(!req.session.user){
      return res.render('user/login');
    }

    const userData = await User.findById(req.session.user._id);
      res.render('user/profile',{user:userData});
    
  } catch (error) {
    res.redirect('/pageNotFound');
  }
}


const forgotPassword = async (req,res) => {

  try {
    res.render('user/forgotPassword');
  } catch (error) {
    res.redirect('/pageNotFound');
  }
}


module.exports = {
  loadHomepage,
  pageNotFound,
  loadSignup,
  loadShopping,
  signup,
  verifyOtp,
  resendOtp,
  loadLogin,
  login,
  logout,
  loadProfile,
  forgotPassword,
  
}