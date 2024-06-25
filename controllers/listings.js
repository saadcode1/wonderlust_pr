const mongoose = require("mongoose");
// listing Schema with joi
const ListingSchema=require("../joi");
// listing models
const listingSchema = require("../models/listings");
// listing models
const Listing =mongoose.model("Listing",listingSchema);


module.exports.index= async (req, res, next) => {
    const listingData = await Listing.find({});
    res.render("list.ejs", { listingData });
}

module.exports.listForm=(req, res, next) => {

    res.render("form.ejs");

}

module.exports.listData=async (req, res, next) => {
    const { id } = req.params;
    const listedData = await Listing.findById(id).populate({path:"review",populate:{path:"author"}
    }).populate("owner");
    if (!listedData) {
       req.flash("error"," Request You Are Trying To Find Does Not Exist");
       res.redirect("/airBNB");
    }
    console.log(req.user);
    res.render("show.ejs", {listedData});
}

module.exports.listEdit=async (req, res, next) => {
    const { id } = req.params;
    const editData = await Listing.findById(id);
    if (!editData) {
      throw new ExpressError(400,"Listing Does NOt Exists");
    }
    res.render("edit.ejs", { editData });
}

module.exports.listUpdate=async (req, res, next) => {
    const { id } = req.params;
    const updatedData = await Listing.findByIdAndUpdate(id,{...req.body.allUpdate});
    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let file=req.file.filename;
        updatedData.image={url,file}
        await updatedData.save();
    }
   
    if (!updatedData) {
      throw new ExpressError(400,"Listing Does NOt Exists");
    }
    res.redirect(`/airBNB/${id}/show`);
}

module.exports.listDelete=async (req, res, next) => {
    const { id } = req.params;
    const deletedData = await Listing.findByIdAndDelete(id);
    if (!deletedData) {
        return next(new ExpressError(400,"Listing Not Found"));
    }
    res.redirect("/airBNB");
}

module.exports.listCreate=async (req, res, next) => {
    let url=req.file.path;
    let file=req.file.filename;
    let result=ListingSchema.validate(req.body);
    if(result.error){
      throw new ExpressError(400,result.error);
    }
   let addedData= new Listing(req.body.listing);
   addedData.image={url,file}
   addedData.owner=req.user._id;
   req.flash("success", "New listing Is Created!")
    await addedData.save();
    res.redirect("/airBNB");
     
}