const  experess = require("express")
const app = experess()
const bodyParser = require("body-parser")
const _ = require("lodash")
const ejs = require("ejs")
const session = require("express-session")
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

app.use(experess.static("public"))
app.use(bodyParser.urlencoded({ extended:true }))
app.set("view engine","ejs")


require('dotenv').config()

//Initialize session
app.use(session({
    secret: "ThisisMyOwnSecretString.",
    resave: false,
    saveUninitialized: false,
  }))

app.use(passport.initialize())
app.use(passport.session())



//Mongoose code

const mongoose = require("mongoose")

 mongoose.connect("mongodb+srv://rahul1851:rahul1851@cluster0.mnolrk5.mongodb.net/blogIt")

//mongoose.connect("mongodb://localhost:27017/blogIT");

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
    
    if(req.isAuthenticated()){
                res.render("compose");
            }
            else{
                res.redirect("/login");
            }
     
})

app.get("/logout",function(req,res){
        req.logOut((err)=>{
            if(err){console.log(err)}
            else{
                res.redirect("/");
            }
        })
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



   postModel.findOne({_id:postid},function(err,result){
    if(!err){ 
        res.render("post",{postT:result.title,postC:result.content})
   }
})

})









///////////////////////Database code ///////////////////////////////


const userSchema = new mongoose.Schema({
    name : String,
    username: String,
    password: String,
    googleId:  String,
    provider: String,
    email: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new  mongoose.model("user",userSchema)

// passport local configuration
passport.use(User.createStrategy());

 passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


//Google stratergy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/compose"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id,username: profile.id},{
      provider: "google",
      email: profile._json.email
    }, function (err, user) {
      return cb(err, user);
    });
  }
));


///////////////////////////// APP code ///////////////////////////


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/auth/google/compose', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/compose');
  });


app.get("/login",function(req,res){
    res.render("login")

})
app.get("/register",function(req,res){
    res.render("register")

})



//////////////////// Post code ////////////////////////////

var count = 0;
app.post("/register",function(req,res){
   count++;
   User.register({name:req.body.username,username:req.body.username,email:req.body.username,provider:"local",googleId:count},req.body.password,function(err,user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }
      else{
        passport.authenticate("local")(req,res,function(){
               res.redirect("/compose")
        })
      }

   })


    
 });

 app.post("/login",function(req,res){

    const user = new User({
        username: req.body.username ,
        password : req.body.username
    })

    req.login(user, function(err) {
        if (err) { console.log(err) }
       else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/compose")
        })
       }
      });

 });




 app.listen(process.env.PORT || 3000,function(req,res){
    console.log("Server is runnig on port 3000")
})