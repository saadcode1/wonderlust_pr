const mongoose = require("mongoose");
// listing schema
const listingSchema = require("../models/listings");
// listing models
const Listing =mongoose.model("Listing",listingSchema);

// user Model
const User=require("../models/user.js");

module.exports.signUpForm=(req,res)=>{
   return res.render("./user/signup.ejs");
}

module.exports.signUp=async (req,res,next)=>{
    try{
        let {email,username,password}=req.body;
        let ragisterUser=new User({
            email,username
        });
        let user1=await User.register(ragisterUser,password)
        new Listing({
          $push: { owner: user1._id }
      });
        req.login(user1,(err)=>{
          if(err){
            console.log(err);
            return next(err);
          }
          req.flash("signup","YOU ARE SIGNED UP SUCCESSFULLY!");
         return res.redirect("/airBNB");
        })
       
    }catch(e){
        req.flash("error",e.message);
       return res.redirect("/signup");
        
    }
   
}

module.exports.loginForm=(req,res)=>{
   return res.render("./user/login.ejs");
}

module.exports.loggedIn=(req, res)=> {
    try{
        req.flash("success","You are successfully logedIn!")
        let ogRedirect=res.locals.redirectUrl || "/airBNB";
        console.log(ogRedirect)
       return res.redirect(ogRedirect);
       
    }catch(e){
        req.flash("error",e.message);
    }
  
  }

  module.exports.loggedOut=function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success","You are Logged Out!");
     return res.redirect('/airBNB');
    });
  }