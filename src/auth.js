const index = require('./index');
const md5 = require('md5');
const model = require('./model');
// const redis = require('redis').createClient("redis://h:pff2dfa29c343c0a7f1bdbadf0ed56fd75a2b471b2792771abe26013ce78755a1@ec2-100-24-153-19.compute-1.amazonaws.com:20569");
const Response = model.Response;
const IDCounterSchema =  model.IDCounterSchema;
const UserSchema = model.UserSchema;
const ProfileSchema = model.ProfileSchema;
const pepper = md5('Rice Village');
const sessionMap = {};
const RICE_VILLAGE_WEB = 'http://localhost:4200/#';
// const RICE_VILLAGE_WEB = 'http://rice-village-yuanmengzeng.surge.sh/#';


IDCounterSchema.findOne().exec((err,docs)=>{
    if(err) {
        console.log("idCounter err:"+err); return;
    }
    console.log("idCounter docs->"+docs);
    // docs.userId = 1;
    // docs.save();
});


/**
 * middleware used to check if the cookie contains the sessionId which specify a user
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function isLoggedIn(req,res,next){
    console.log('isLoggedIn===============');
    console.log('header cookie->'+req.headers.cookie);
    if(req.headers.cookie){
        let sid = getSidFromCookie(req.headers.cookie);
        const now = Date.now();
        if(!sid || !sessionMap[sid] || now>sessionMap[sid].expireTime){
            res.status(401).send({errorCode:100,message:'Please re-login'});
            return;
        }
        req.userId = sessionMap[sid].userId;
        // redis.hgetall('session',(err,object)=>{
        //     console.log("redis->"+JSON.stringify(object))
        // });
        console.log('isLoggedIn req.userId->'+req.userId);
        next();
        return;
    }
    res.status(401).send({errorCode:100,message:'Please re-login'});
}

function getSidFromCookie(cookie){
    let cookies = cookie.split('; ')
    let sid;
    cookies.find((item)=>{
        let keyValue = item.split('=');
        if(keyValue[0]==='sid') {
            sid = keyValue[1];
            return true;
        }
    });
    return sid;

}

/**
 * handler the '/login' request, login a user
 * @param request req 
 * @param response res 
 */
function login(req,res){
    console.log('login===============');
    if(!req.body.username||!req.body.password){
        res.status(400).send('username field and password field are both required');
        return;
    }
    UserSchema.findOne({username:req.body.username},(err,item)=>{
        if(err||!item){
            res.status(200).send({errorCode:1,message:'user does not exist'});
            return;
        }
        const salt = item.salt;
        const saltedPassword = md5(req.body.password,salt);
        if(saltedPassword!=item.saltedPassword){
            res.status(200).send({errorCode:2,message:'password error'});
            return;
        }
        const sessionId = md5(pepper+salt+saltedPassword+Date.now());
        // redis.hmset('session',sessionId,JSON.stringify({userId: item.userId, expireTime: Date.now()+3600000}));
        sessionMap[sessionId] ={userId: item.userId, expireTime: Date.now()+3600000};
        console.log(sessionMap);
        res.cookie('sid',sessionId,{maxAge:3600000,httpOnly:true});
        res.cookie('userId',item.userId,{maxAge:5000});
        res.cookie('userType','normal',{maxAge:5000});
        res.status(200).send({errorCode:0,message:'success',username: req.body.username,userId:item.userId});
    });
}

/**
 * handler the '/register' request, register a new user
 * @param request req 
 * @param response res 
 */
function register(req,res){
    console.log("register new User   >>>>>>>>");
    if(!req.body.username||!req.body.email||!req.body.zipCode||!req.body.dob||!req.body.phone||!req.body.password){
        res.status(400).send('username field,email field,zipCode field,dob field,phone field and password field are required');
        return;
    }
    // check if the username exists
    UserSchema.findOne({username:req.body.username}).exec((err,items)=>{
        if(err){
            console.log("err:"+err);
            return;
        }
        console.log("  items:"+items);
        if(items && items.length!=0){
            let result = {errorCode:1, message :'the username has been occupied'};  // response json that will be returned to the front-end
            res.status(200).send(result);
            return;
        }
        const salt = md5(req.body.username+req.body.phone);
        const saltedPassword = md5(req.body.password,salt);
        IDCounterSchema.findOne((err,doc)=>{
            let userId = doc.userId;
            console.log("userId->"+userId);
            const user = new model.User(userId, req.body.username, salt, saltedPassword,false,"");
            const defaultAvatar = 'http://www.ejdyin.com/data/img/article/2016081514365489415955.jpg';
            const profile = new model.Profile(userId, req.body.username, req.body.email, req.body.zipCode, req.body.dob, req.body.phone, 'I am '+req.body.username,defaultAvatar)
            new UserSchema(user).save();
            new ProfileSchema(profile).save();
            doc.userId++;
            doc.save();
            res.status(200).send({errorCode:0, message:'success', username:user.username});
        });
        
    });
}

    //http://localhost:5000/login/facebook
    //732938157085768
    //732938157085768
function loginWithFacebook(req,res,next){
        passport.authenticate('facebook', function(err, fbProfile, info) {
            console.log("authenticate:",req.isAuthenticated())
            if(err){
                console.log("loginWithFacebook err -> ",err);
                res.redirect(302,RICE_VILLAGE_WEB+'/');
                res.end();
                return;
            }
            // already login, link the facebook account
            if(req.userId){
                UserSchema.findOne({userId:req.userId},(err,logginedUser)=>{
                    UserSchema.findOne({facebookId:fbProfile.id},(err,thirdPartyUser)=>{
                        if(thirdPartyUser){
                            merge(logginedUser,thirdPartyUser.userId,(result)=>{
                                res.redirect(RICE_VILLAGE_WEB+'/profile');
                            });
                        }else{
                            logginedUser.facebookId=fbProfile.id;
                            logginedUser.save();
                            ProfileSchema.findOneAndUpdate({userId:req.userId},{$set:{facebookId:fbProfile.id}},(err,newProfile)=>{
                                res.redirect(RICE_VILLAGE_WEB+'/profile');
                            });
                        }
                    });
                });
                return;
            }

            UserSchema.findOne({facebookId:fbProfile.id},(err,doc)=>{
                if(err){
                    res.redirect(302,RICE_VILLAGE_WEB+'/');
                    res.end();
                    return; 
                }
                // the database has the user, login 
                if(doc){
                    console.log("facebook old user");
                    const sessionId = md5(pepper+doc.facebookId+Date.now());
                    // redis.hmset('session',sessionId,JSON.stringify({userId: item.userId, expireTime: Date.now()+3600000}));
                    sessionMap[sessionId] ={userId: doc.userId, expireTime: Date.now()+3600000};
                    console.log(sessionMap);
                    res.cookie('sid',sessionId,{maxAge:3600000,httpOnly:true});
                    res.cookie('userId',doc.userId,{maxAge:5000});
                    if(doc.salt && doc.saltedPassword){
                        res.cookie('userType','normal',{maxAge:5000});
                    }else{
                        res.cookie('userType','facebook',{maxAge:5000});
                    }
                    res.redirect(302,RICE_VILLAGE_WEB+'/main');
                    res.end();
                    // res.status(200).send({errorCode:0,message:'success',username: req.body.username,userId:item.userId});
                }
                // new user, register
                else{
                    console.log("facebook new user");
                    IDCounterSchema.findOne((err,doc)=>{
                        let userId = doc.userId;
                        console.log("userId->"+userId);
                        const username = fbProfile.displayName+"_fb";
                        const user = new model.User(userId, username , "", "", true, fbProfile.id);
                        const defaultAvatar = 'http://www.ejdyin.com/data/img/article/2016081514365489415955.jpg';
                        const profile = new model.Profile(userId, username, fbProfile.emails[0].value, "00000", 1, "xxx-xxx-xxxx", 'I am '+username,defaultAvatar)
                        profile.facebookId = fbProfile.id;
                        new UserSchema(user).save();
                        new ProfileSchema(profile).save();
                        doc.userId++;
                        doc.save();

                        const sessionId = md5(pepper+fbProfile.id+Date.now());
                        // redis.hmset('session',sessionId,JSON.stringify({userId: item.userId, expireTime: Date.now()+3600000}));
                        sessionMap[sessionId] ={userId:userId, expireTime: Date.now()+3600000};
                        console.log(sessionMap);

                        res.cookie('sid',sessionId,{maxAge:3600000,httpOnly:true});
                        res.cookie('userId',userId,{maxAge:5000});
                        res.cookie('userType','facebook',{maxAge:5000});
                        res.redirect(302,RICE_VILLAGE_WEB+'/main');
                        res.end();
                    });
                }
            });
            // console.log("user--------");
            // console.log(fbProfile);
        })(req, res, next);
}

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookJson = {
    clientID:"733045343728113",
    clientSecret:"b12e49d1cab6287e2b61da9aa147b650",
    callbackURL:"http://localhost:5000/facebook_callback",
    profileFields:['emails','displayName','profileUrl','picture.type(large)']
}
passport.serializeUser((user,done)=>{
    console.log("serializeUser=-=====");
    console.log(user);
    done(null,user.id);
})
passport.use(new FacebookStrategy(FacebookJson,(accessToken,refreshToken,profile,done)=>{
    console.log("accessToken->",accessToken);
    console.log("refreshToken",refreshToken);
    done(null,profile);
}));


function linkAccount(req,res){
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password){
        res.status(400).send("field username and password are required");
        return ;
    }
    UserSchema.findOne({username:username},(err,item)=>{
        if(err||!item){
            res.status(200).send({errorCode:1,message:'user does not exist'});
            return;
        }
        const salt = item.salt;
        const saltedPassword = md5(password,salt);
        if(saltedPassword!=item.saltedPassword){
            res.status(200).send({errorCode:2,message:'password error'});
            return;
        }
        merge(item,req.userId,(result)=>{
            if(result){
                let sid = getSidFromCookie(req.headers.cookie);
                delete sessionMap[sid];
            }else{

            }
            res.status(200).send(result);
            res.end();
        });
    });
}

/**
 * merge the facebook account and normal account 
 */
function merge(normalUser, thirdPartyUserId, callback){
    UserSchema.findOne({userId:thirdPartyUserId},(err,thirdPartyUser)=>{
        normalUser.facebookId = thirdPartyUser.facebookId;
        normalUser.save();
        UserSchema.findOneAndRemove({userId:thirdPartyUserId},(err)=>{
            console.log("remove user schema ==== ");
            console.log(err);
            console.log('user schema =========');
        });
        ProfileSchema.find({userId:{$in:[normalUser.userId,thirdPartyUserId]}},(err,profiles)=>{
            let normalProfile;
            let thirdProfile;
            profiles.forEach(profile=>{
                if(profile.userId===normalUser.userId){
                    normalProfile = profile; 
                }
                else if(profile.userId===thirdPartyUserId){
                    thirdProfile = profile;
                }
            });
            // merge the following id
            thirdProfile.following.forEach((followingId)=>{
                let findSameId = false;
                for(let i=normalProfile.following.length-1; i>=0; i--){
                    if(normalProfile.following[i]===thirdPartyUserId){
                        normalProfile.following.splice(i,1);
                    }else if(normalProfile.following[i]===followingId){
                        findSameId = true;
                    }
                }
                if(!findSameId){
                    normalProfile.following.push(followingId);
                }
            });

            normalProfile.facebookId = thirdPartyUser.facebookId;
            normalProfile.save();

            ProfileSchema.remove({userId:thirdPartyUserId},(err,res)=>{
                console.log("remove ProfileSchema  ==== ");
                console.log(err);
                console.log('ProfileSchema =========');
            });
            
            model.ArticleSchema.updateMany({userId:thirdPartyUserId},{$set:{userId:normalUser.userId}},(err,raw)=>{
                console.log('merge article=======');
                console.log(raw);
            });

            model.CommentSchema.updateMany({userId:thirdPartyUserId},{$set:{userId:normalUser.userId}},(err,raw)=>{
                console.log('merge comment=======');
                console.log(raw);
            });
            callback(new Response(0,"success", normalProfile));
        });
    });
}


function unlinkFacebook(req,res){
    UserSchema.findOneAndUpdate({userId:req.userId},{$set:{facebookId:''}},(err,doc)=>{
        console.log(doc);
    });
    ProfileSchema.findOneAndUpdate({userId:req.userId},{$set:{facebookId:''}},(err,doc)=>{
        console.log(doc);
        doc.facebookId='';
        res.status(200).send(new Response(0,'success',doc));
    });
    
}

/**
 * logout, clear loggedin user's session
 * @param {request} req 
 * @param {response} res 
 */
function logout(req,res){
    let sid = getSidFromCookie(req.headers.cookie);
    console.log("before sessionMap->"+JSON.stringify(sessionMap));
    delete sessionMap[sid];
    console.log("after sessionMap->"+JSON.stringify(sessionMap));
    res.status(200).send({errorCode:0, message:'success'});
}


module.exports.login = login;
module.exports.register = register;
module.exports.isLoggedIn = isLoggedIn;
module.exports.logout = logout;
module.exports.loginWithFacebook = loginWithFacebook;
module.exports.passport = passport;
module.exports.linkAccount = linkAccount;
module.exports.unlinkFacebook = unlinkFacebook;

