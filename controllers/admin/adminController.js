const User = require('../../models/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const loadLogin = async (req,res) => {
  try {
    if(req.session.admin){
      return res.render('admin/dashboard');
    }
    const message = req.session.loginError || null;
    req.session.loginError = null;
    res.render('admin/login', { message });
  } catch (error) {
    res.render('admin/pageNotFound');
  }
}



const login = async (req,res) => {
  try {
    const {email,password} = req.body;
    const admin = await User.findOne({email,isAdmin:true});

    if(admin){
      const passwordMatch = bcrypt.compare(password,admin.password);

      if(passwordMatch){
        req.session.loginError = 'Invalid credentials';
        return res.redirect('/admin');
      }else{
        return res.redirect('/admin/login',{ message: 'Invalid credentials' })
      }
    }else{
      req.session.loginError = 'Invalid credentials';
      return res.redirect('/admin/login');
    }
  } catch (error) {
    console.log('login error',error);
    return res.redirect('/admin/pageNotFound');
  }
}


const loadDashboard = async(req,res)=>{
  if(req.session.admin){
    try {
     return res.render('admin/dashboard');
    } catch (error) {
     return res.redirect('/admin/pageNotFound');
     console.log('Error',error.message);
    }
  }
}


module.exports = {
  loadLogin,
  login,
  loadDashboard,

}