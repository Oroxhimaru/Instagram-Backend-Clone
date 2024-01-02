var express = require('express');
var router = express.Router();
const passport = require('passport'); //...
const userModel = require("./users");
const upload = require("./multer");
const postModel = require("./post");

const localStrategy = require("passport-local"); //...
passport.use(new localStrategy(userModel.authenticate()));



router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed',isLoggedIn,async function(req, res) {
  const posts = await postModel.find().populate("user")  //coz field name is user in post.js, only that thing populate which has id
  res.render('feed', {footer: true, posts });
});


router.get('/profile',isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts")

  res.render('profile', {footer: true, user });
});

router.get('/search',isLoggedIn, function(req, res) {
  res.render('search', {footer: true});
});

router.get('/edit',isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('edit', {footer: true, user });
});

router.get('/upload',isLoggedIn, function(req, res) {
  res.render('upload', {footer: true});
});


router.get('/username/:username',isLoggedIn,async function(req, res) {
   const regex = new RegExp(`^${req.params.username}`,'i');
 const users = await userModel.find({username: regex})
 res.json(users);
});



//register route
router.post('/register', (req,res) => {
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password  // Ensure that the password field is set
  });
  //console.log('User data:', userData); // Log the user data before registration 

  userModel.register(userData, req.body.password)
  .then(function () {
    passport.authenticate("local")(req,res,function (){
      res.redirect('/profile');
    });
  })
  .catch(function (err) {
    console.error('Registration error:', err);
    // Handle the error, possibly redirect to an error page or show an error message.
    res.redirect('/'); // Redirect to the registration page on error.
  });
});

//login route
router.post("/login", passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect: '/login'
}), function (req,res){ 
});  //passport.authenticate() is working as a middleware here between route and function

//logout route
router.get('/logout', (req,res,next) => {
  req.logout(function(err){
   if (err) { return next(err); }
     res.redirect('/login');
  });
});


function isLoggedIn(req,res,next){
 if(req.isAuthenticated()){   //if we are logged in then it will go ahead.
   return next();
 }
 res.redirect('/login');  //otherwise go to homepage
}

router.post('/update', upload.single('image') , async (req,res) => {
  const user = await userModel.findOneAndUpdate({username: req.session.passport.user},{username: req.body.username, name: req.body.name, bio: req.body.bio },{ new: true });
  if(req.file){
    user.profileImage = req.file.filename;
  }
  await user.save();
  res.redirect('/profile');

});

router.post("/upload",isLoggedIn,upload.single("image"), async (req,res) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const post = await postModel.create({
    picture: req.file.filename,
    user: user._id,
    caption: req.body.caption
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/feed");
});
 
module.exports = router;
