const mongoose = require("mongoose");

// // listing schema
const listingSchema = require("./models/listings");
// // listing models
const Listing =mongoose.model("Listing",listingSchema);


module.exports=isLoggedIn=(req,res,next)=>{
  console.log("7th running middleware")
    if(!req.isAuthenticated()){
         req.session.redirectUrl=req.originalUrl;
        req.flash("error","Does Not Exist User!");
       return res.redirect("/login")
    }
    next();
}

module.exports.isRedirectUrl=(req,res,next)=>{
  console.log("6th running middleware")
  if(req.session.redirectUrl){
   res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}


module.exports.isOwner=async (req,res,next)=>{
  console.log("5th running middleware")
  let {id}=req.params;
  console.log(id)
  const listing= await  Listing.findById(id).populate('owner');
  console.log(listing)
  console.log(req.user);
  console.log(listing.owner._id);
  for(let i=0;i<listing.owner.length;i++){
       console.log(listing.owner[i]);
       if(!listing.owner[i].equals(res.locals.userReq._id)){
        req.flash("error","You Dont Have Previlage!");
        return  res.redirect(`/airBNB/${id}/show`);
      }
  }
  console.log("working")
  next();
}