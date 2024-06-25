if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express = require("express");
const mongoose = require("mongoose");
// requiring express
const app = express();
const port = 8085;
// method-override
const methodOverride = require("method-override");
const engine = require('ejs-mate');
const path = require("path");
const Review = require('./models/reviews.js');
const ExpressError = require('./expressError');
const wrapAsync = require('./wrapAsync');
// express-session requiring
const session = require('express-session');
// // mongoStore session information
const MongoStore = require('connect-mongo');
// requiring connect flash
const flash = require('connect-flash');
// requiring passport
const passport=require("passport");
const LocalStrategy=require("passport-local");
// user Model
const User=require("./models/user.js");
// isLoggedIn functionality Middlewares reqquiring
const isLoggedIn=require("./middlewares.js");
// listing schema
const listingSchema = require("./models/listings");
// isRedirecturl url variables accessing
const {isRedirectUrl}=require("./middlewares.js")

app.use(express.json()); // Middleware to parse JSON bodies

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));
app.engine('ejs', engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
// env variable of mongooDbAtla
const mongooDbAtlas=process.env.mongooDbAtlas;
// Connect to MongoDB
main().then(() => {
    console.log("Connection successfully done");
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongooDbAtlas);
}

// route object requiring
const route=require("./routers/listings.js");
const userRouter=require("./routers/user.js");
const { regex } = require('./joi.js');
// listing models
const Listing =mongoose.model("Listing",listingSchema);

const store=MongoStore.create({
    mongoUrl:mongooDbAtlas,
    crypto:{
        secret:'secretpasswordCookies'
    },
    touchAfetr:24 * 3600,
});

store.on("error",()=>{
    console.log("Error occured in Store Mongo Session!",err);
})

app.use(session({
    store,
    secret: process.env.Secret_key,
    resave: false,
  saveUninitialized: true,
  cookie:{
    expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
  }));

//    middleware which is accessesing variables inside the template
app.use(flash());
// initialiazing passport request of users
app.use(passport.initialize());
// passport session
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// flash sending messages using variables to the ejs-template
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.signup=req.flash("signup");
    res.locals.userReq=req.user;  
    console.log(res.locals.error);
    next();
})
// searching result route
app.post('/search', async (req, res) => {
    const {searchQ} = req.body; // Get the search query from the request
    console.log(searchQ);
    const listingData = await Listing.find({$or:[
        {"title":{$regex:searchQ}}
    ]}); // Perform the search
    console.log(listingData);
    if(listingData.length){
        res.render('list.ejs', { listingData }); // Render the search results
    }
    else{
        req.flash("error"," Request You Are Trying To Find Does Not Exist");
        res.redirect("/airBNB");
    }

  });
// Ensure the schema hook is defined before compiling the model
listingSchema.post('findOneAndDelete', async (data) => {
    if (data.review.length) {
        let res = await Review.deleteMany({ _id: { $in: data.review } });
        console.log('Posts and Reviews were deleted');
        console.log(res);
    }
});
// maiin rout
app.get("/",(req, res)=>{

    res.redirect("/airBNB");
    })
// usng router object
app.use('/airBNB', route);
app.use('/', userRouter);


// reviw route
app.post('/airBNB/:id/review',isLoggedIn, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    console.log(id)
    console.log(req.body.review);
    let reviewData = req.body.review;
    reviewData.author=res.locals.userReq._id;
    console.log(reviewData);

    if (!reviewData.comment || !reviewData.rating) {
        throw new ExpressError(400, 'Review validation failed');
    }

    let newReview = new Review(reviewData);
    await newReview.save();

    await Listing.findByIdAndUpdate(id, {
        $push: { review: newReview._id }
    });
    res.redirect(`/airBNB/${id}/show`);
}));


// error handling middleWares
app.use((err, req, res, next) => {
    if (err) {
      console.log("2nd running middleware")
      const { status = 500, message = "Something Went Wrong" } = err;
      res.status(status).render("error.ejs",{message});
    } else {
      next(err); // If no error, continue to the next middleware
    }
  });

// Start the server
app.listen(port, () => {
    console.log("Server connected on port", port);
});


