const User = require('../../models/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const pageNotFound = async (req,res) => {
  res.render('admin/pageError');
}

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
        req.session.admin = true;
        return res.redirect('/admin');
      }else{
        return res.redirect('/login');
      }
    }else{
      return res.redirect('/login');
    }
  } catch (error) {
    console.log('login error',error);
    return res.redirect('/pageNotFound');
  }
}


const loadDashboard = async(req,res)=>{
  if(req.session.admin){
    try {
     return res.render('admin/dashboard');
    } catch (error) {
     return res.redirect('/pageNotFound');
     console.log('Error',error.message);
    }
  }
}

const logout = async(req,res)=>{
  try {
    req.session.destroy(err=>{
      if(err){
        console.log('Error destroying session',err);
        return res.redirect('/pageNotFound');
      }
      res.redirect('/admin/login');
    });
  } catch (error) {
    console.log('Unexpected error occured',error);
    res.redirect('/pageNotFound');
  }
}


module.exports = {
  loadLogin,
  login,
  loadDashboard,
  pageNotFound,
  logout,

}