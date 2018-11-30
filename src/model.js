// this is model.js 
require('./db.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: Number,
    username : String,
    salt: String,
    saltedPassword :String,
    isThirdParty: Boolean,
    facebookId : String 
});

const ProfileSchema = new Schema({
    userId : Number,
    username : String,
    email : String,
    zipCode : String,
    dob : Number,
    phone : String,
    headline : String,
    avatar:String,
    following: [Number],
    facebookId:String
});

const IDCounterSchema = new Schema({
    userId: Number,
    commentId:Number,
    articleId:Number,
});

var commentSchema = new mongoose.Schema({
	commentId: Number, userId:Number, content: String, timeStamp: Number
});

var articleSchema = new mongoose.Schema({
	articleId: Number, userId: Number, image: String, timeStamp: Number, content: String, comments: [ Number ]
});


function User(userId, username, salt, saltedPassword, isThirdParty, facebookId){
    this.userId = userId;
    this.username = username;
    this.salt = salt;
    this.saltedPassword = saltedPassword;
    this.isThirdParty = isThirdParty;
    this.facebookId = facebookId;
};

function Profile(userId, username, email, zipCode, dob, phone, headline, avatar){
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.zipCode = zipCode;
    this.dob = dob;
    this.phone = phone;
    this.headline = headline;
    this.avatar = avatar;
    this.following = [];
    this.facebookId = '';
};

function Response(errorCode, message, result){
    this.errorCode = errorCode;
    this.message = message;
    this.result = result;
};

module.exports.ArticleSchema = mongoose.model('article', articleSchema);
module.exports.IDCounterSchema = mongoose.model('IDCounter',IDCounterSchema);
module.exports.UserSchema = mongoose.model('UserProfile',UserSchema);
module.exports.CommentSchema = mongoose.model('Comment',commentSchema);
module.exports.ProfileSchema = mongoose.model('Profile',ProfileSchema);
module.exports.User = User;
module.exports.Profile = Profile;
module.exports.Response = Response;