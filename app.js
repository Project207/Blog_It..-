const  experess = require("express")
const app = experess()
const bodyParser = require("body-parser")
const _ = require("lodash")

app.use(experess.static("public"))
app.use(bodyParser.urlencoded({ extended:true }))

app.set("view engine","ejs")



//Mongoose code

const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://rahul1851:rahul1851@cluster0.mnolrk5.mongodb.net/blogIt")

const postSchema = {
    title: String,
    content: String,
}

const postModel = new mongoose.model("post", postSchema)




/// APP CODE

app.get("/",function(req,res){

  postModel.find({},function(err,result){
    if(!err){
       res.render("home",{post:result})
    }
  })

    
})

app.get("/about",function(req,res){
    res.render("about")
})
app.get("/contact",function(req,res){
    res.render("contact")
})
app.get("/compose",function(req,res){
    res.render("compose")
})


app.post("/compose",function(req,res){

const postDoc = new postModel({
    title: req.body.title,
    content: req.body.content
})
 postDoc.save(function(err){
    if(!err){res.redirect("/");}
 })


})

app.get("/posts/:postId",function(req,res){
   const postid= req.params.postId;
     
//    posts.forEach((result)=>{
//     const postTitle = _.lowerCase(result.title)
//      if(postTitle === postName){
//        res.render("post",{postT:result.title,postC:result.content}) 
//      }
//      else{

//      }
//    })


   postModel.findOne({_id:postid},function(err,result){
    if(!err){ 
        res.render("post",{postT:result.title,postC:result.content})
   }
})

})



app.listen(process.env.PORT || 3000,function(req,res){
    console.log("Server is runnig on port 3000")
})