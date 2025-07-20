const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const passport = require('./config/passport')
const db  = require('./config/db');
const userRouter = require('./routes/userRouter');
db();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    secure:false,
    httpOnly:true,
    maxAge:72*60*60*1000
  }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
  res.set('Cache-control','no-store');
  next();
})

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

app.use('/',userRouter);
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

const PORT =process.env.PORT ||  3111 ;
app.listen(PORT,()=>{
  console.log(`Server running at http://localhost:${PORT}`);
});