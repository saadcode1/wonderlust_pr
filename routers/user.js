const express = require("express");
const mongoose = require("mongoose");
const router=express.Router();
// listing schema
const listingSchema = require("../models/listings");
// listing models
const Listing =mongoose.model("Listing",listingSchema);
const wrapAsync = require('../wrapAsync');
// user Model
const User=require("../models/user.js");
// isRedirecturl url variables accessing
const {isRedirectUrl}=require("../middlewares.js");
// requiring passport
const passport=require("passport");
const LocalStrategy=require("passport-local");

const controller=require("../controllers/users.js");

router.get("/signup",wrapAsync(controller.signUpForm));

router.post("/signup", wrapAsync(controller.signUp));

router.get("/login",wrapAsync(controller.loginForm))

router.post('/login',isRedirectUrl, 
  passport.authenticate('local', { failureRedirect: '/login',failureFlash:true }),controller.loggedIn);

  router.get('/logout', controller.loggedOut);

module.exports=router;