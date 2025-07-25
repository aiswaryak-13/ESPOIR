const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userSchema');
const env = require('dotenv').config();


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:6001/auth/google/callback', 
  passReqToCallback: true 
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const user = await User.findOne({ email: email });

    const isSignup = req.session.googleSignup;

    if (user) {
      
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    } else {
     
      if (isSignup) {
        const newUser = new User({
          name: profile.displayName,
          email: email,
          googleId: profile.id
        });
        await newUser.save();
        return done(null, newUser);
      } else {
        return done(null, false, { message: "Email not found. Please sign up first." });
      }
    }

  } catch (error) {
    return done(error, null);
  }
}));



passport.serializeUser((user,done)=>{
 done(null,user.id)
});

passport.deserializeUser((id,done)=>{
  User.findById(id)
  .then(user=>{
    done(null,user)
  })
  .catch(err=>{
    done(err,null);
  })
})

module.exports = passport;