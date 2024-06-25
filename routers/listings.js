const express = require("express");
const mongoose = require("mongoose");
const route=express.Router({ mergeParams: true });
// listing Schema with joi
const ListingSchema=require("../joi");
const methodOverride = require("method-override");
// listing models
const listingSchema = require("../models/listings");
// requiring middle which is check owner
const {isOwner}=require("../middlewares");
// review model
const ExpressError = require("../expressError");
const wrapAsync = require("../wrapAsync");

// requiring controllers
const controller=require("../controllers/listings.js")

// multer is library used for send file in object form!
const multer  = require('multer')
const {storage}=require("../cloudinarConfig.js");
// uploads files or photo to defined destination
const upload = multer({storage})

// listing models
const Listing =mongoose.model("Listing",listingSchema);
// Routes main route
route.get("/", wrapAsync(controller.index));


// added form route
route.get("/add",isLoggedIn,wrapAsync(controller.listForm));
// listings show route
route.get("/:id/show", wrapAsync(controller.listData));
// edite route 
route.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(controller.listEdit));
// listing update route
route.put("/:id",isLoggedIn,isOwner,upload.single('allUpdate[image]'),wrapAsync(controller.listUpdate));
// delete route
route.get("/:id/delete",isLoggedIn,isOwner, wrapAsync(controller.listDelete));
// new added route
route.post("/add/added",upload.single('listing[image]'), wrapAsync(controller.listCreate));

module.exports=route;