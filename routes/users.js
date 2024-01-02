const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

//setup mongoose
mongoose.connect("mongodb://127.0.0.1:27017/instagram");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, validate: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/ },
  password: { type: String, required: true },
  profileImage: String,
  bio: String,
  posts: [{type: mongoose.Schema.Types.ObjectId, ref:"post"}],
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
