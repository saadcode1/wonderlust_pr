const mongoose=require("mongoose");
const listingSchema=require("../models/listings.js");
// listing models
const Listing =mongoose.model("Listing",listingSchema);
const initData=require("./data.js");

// making connection with mongoDB
main()
.then(()=>{
   console.log("connections successfully done");
})
.catch(err => console.log(err));

async function main() {
await mongoose.connect('mongodb://127.0.0.1:27017/airBNB');

// use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

init = async ()=>{
   await Listing.deleteMany({});
   initData.data=initData.data.map((obj)=>({...obj,owner:"6668953579af5663d1f04e37"}))
   await Listing.insertMany(initData.data);
   console.log("data was successfully initialized");
}

init().then(res=>{
    console.log(res);
})
