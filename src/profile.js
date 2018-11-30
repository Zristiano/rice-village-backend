// const express = require('express');
// const app = express();
// app.use(express.json());

// const emails = [
//     {user:'kk1',email:"kk1@rice.edu", zipcode:'11344',avatar:'http://dfs/erew1.png'},
//     {user:'rd1',email:"rd1@rice.edu", zipcode:'11345',avatar:'http://dfs/erew2.png'},
//     {user:'Ozil1',email:"Ozil1@rice.edu", zipcode:'11346',avatar:'http://dfs/erew3.png'}
// ];
// app.get('/email/:user',(req,res)=>{
//     const user = req.params.user;
//     const email = emails.find((item)=>{
//         if(item.user===user){
//             return true;
//         }
//     });
//     if(!email){
//         res.status(404).end();
//         return;
//     }
//     res.status(200).send({email:email.email});
// });

// app.get('/zipcode/:user',(req,res)=>{
//     const user = req.params.user;
//     const email = emails.find((item)=>{
//         if(item.user===user){
//             return true;
//         }
//     });
//     if(!email){
//         res.status(404).end();
//         return;
//     }
//     res.status(200).send({zipcode:email.zipcode});
// });

// app.get('/avatar/:user',(req,res)=>{
//     const user = req.params.user;
//     const email = emails.find((item)=>{
//         if(item.user===user){
//             return true;
//         }
//     });
//     if(!email){
//         res.status(404).end();
//         return;
//     }
//     res.status(200).send({avatar:email.avatar});
// });

// app.put('/email',(req,res)=>{
//     if(!req.body.user || !req.body.email){
//         res.status(400);
//         return;
//     }
//     const profile = emails.find((item,index)=>{[]
//         if(item.user===req.body.user){
//             emails[index].email = req.body.email;
//             return true;
//         }
//     });
//     if(!profile){
//         res.status(404).end();
//         return;
//     }
//     res.status(200).send({emaill:profile.email});
// });

// const port = process.env.Port | 8888;
// app.listen(port,()=>console.log(`listening on port ${port}...`));\

const model = require('./model');
const md5 = require('md5');
const Response = model.Response;

/**
 * get multiplie users headline
 * @param {request} req 
 * @param {response} res 
 */
function getHeadlines(req,res){
    let userIds = [];
    if(req.params.userIds){
        let userIdString = req.params.userIds.split(',');
        for(let i=0; i<userIdString.length; i++){
            let num = parseInt(userIdString[i]);
            if(!isNaN(num)){
                userIds.push(num);
            }
        }
    }else{
        userIds.push(req.userId);
    }
    
    console.log('after filter userIds->'+userIds);
    model.ProfileSchema.find({userId:{$in:userIds}},{_id:0,username:1,headline:1},(err,docs)=>{
        res.status(200).send({errorCode:0,message:'success',headlines:docs});
    });
}

/**
 * update the headline of certain user
 * @param {request} req 
 * @param {response} res 
 */
function updateHeadline(req,res){
    if(!req.body.headline){
        res.status(400).send('headline field is required');
    }
    model.ProfileSchema.findOneAndUpdate({userId:req.userId},{headline:req.body.headline},(err,doc,ress)=>{
        if(err){
            res.status(200).send({errorCode:1,message:'server error'});
            return;
        }
        res.status(200).send({errorCode:0, message:'success', result:{loggedInUser:doc.username, headline:req.body.headline}});
    });
}

/**
 * get certain user's profile
 * @param {request} req 
 * @param {response} res 
 */
function getProfile(req,res){
    model.ProfileSchema.findOne({userId:req.userId},(err,doc)=>{
        if(err||!doc){
            res.status(200).send(new Response(1,'server error'));
            return;
        }
        res.status(200).send(new Response(0,'success',doc));
    });
}

/**
 * update user's profile according to req.body 
 */
function putProfile(req,res){
    const newEmail = req.body.email;
    const newPhone = req.body.phone;
    const newZipcode = req.body.zipcode;
    model.ProfileSchema.findOne({userId:req.userId},(err,profile)=>{
        if(newEmail){
            profile.email = newEmail;
        }
        if(newPhone){
            profile.phone = newPhone;
        }
        if(newZipcode){
            profile.zipCode = newZipcode;
        }
        profile.save();
        console.log("new profile->"+JSON.stringify(profile));
        res.status(200).send(new Response(0,'success',profile));
    });
}

function getEmail(req,res){
    let userId = req.userId;
    if(req.params.userId){
        userId = req.params.userId;
    }
    getUserProfile(userId,{_id:0,userId:1,username:1,email:1},(profile)=>{
        if(profile){
            res.status(200).send(new Response(0,'success',profile));
        }else{
            res.status(200).send(new Response(1,"cannot find the corresponding user"));
        }
    });
}

function putEmail(req,res){
    const newEmail = req.body.email;
    if(!newEmail){
        res.status(400).send('email field is required');
        return;
    }
    updateProfile(req.userId,{email:newEmail},profile=>{
        if(!profile){
            res.status(200).send(new Response(1,"cannot find the corresponding user"));
        }else{
            res.status(200).send(new Response(0,'success',{userId:profile.userId, username:profile.username, email:newEmail}));
        }
    });
}

/**
 * get user's zipCode
 */
function getZipcode(req,res){
    let userId = req.userId;
    if(req.params.userId){
        userId = req.params.userId;
    }
    getUserProfile(userId,{_id:0,userId:1,username:1,zipCode:1},(profile)=>{
        if(profile){
            res.status(200).send(new Response(0,'success',profile));
        }else{
            res.status(200).send(new Response(1,"cannot find the corresponding user"));
        }
    });
}

/**
 * update user's zipCode
 */
function putZipcode(req,res){
    const newZipcode = req.body.zipcode;
    if(!newZipcode){
        res.status(400).send('zipcode field is required');
        return;
    }
    updateProfile(req.userId,{zipCode:newZipcode},profile=>{
        if(!profile){
            res.status(200).send(new Response(1,"cannot find the corresponding user"));
        }else{
            res.status(200).send(new Response(0,'success',{userId:profile.userId, username:profile.username, zipCode:newZipcode}));
        }
    });
}

/**
 * get the user's birthday
 */
function getDob(req,res){
    let userId = req.userId;
    if(req.params.userId){
        userId = req.params.userId;
    }
    getUserProfile(userId,{_id:0,userId:1,username:1,dob:1},(profile)=>{
        if(profile){
            res.status(200).send(new Response(0,'success',profile));
        }else{
            res.status(200).send(new Response(1,"cannot find the corresponding user"));
        }
    });
}

function getAvatars(req,res){
    let userIds = [];
    if(req.params.userIds){
        let userIdString = req.params.userIds.split(',');
        for(let i=0; i<userIdString.length; i++){
            let num = parseInt(userIdString[i]);
            if(!isNaN(num)){
                userIds.push(num);
            }
        }
    }else{
        userIds.push(req.userId);
    }
    
    model.ProfileSchema.find({userId:{$in:userIds}},{_id:0,username:1,avatar:1},(err,docs)=>{
        res.status(200).send(new Response(0,'success',docs));
    });
}

function putAvatar(req,res){
    console.log("putAvatar======");
    console.log(req.body);
    const newAvatar = req.body.image;
    if(!newAvatar){
        res.status(400).send('image field is required');
        return;
    }
    updateProfile(req.userId,{avatar:newAvatar},profile=>{
        if(!profile){
            res.status(200).send(new Response(1,"cannot find the corresponding user"));
        }else{
            res.status(200).send(new Response(0,'success',{userId:profile.userId, username:profile.username, avatar:newAvatar}));
        }
    });
}

function putPassword(req,res){
    const newPassword = req.body.password;
    if(!newPassword){
        res.status(400).send('password field is required');
        return;
    }
    model.UserSchema.findOne({userId:req.userId},(err,user)=>{
        const saltedPassword = md5(newPassword, user.salt);
        user.saltedPassword = saltedPassword;
        user.save();
        res.status(200).send(new Response(0,'success',{username:user.username}));
    })
}

/**
 * get user profile from mongoDB according given userId 
 * @param  userId 
 * @param  projection 
 * @param  callback 
 */
function getUserProfile(userId,projection,callback){
    model.ProfileSchema.findOne({userId:userId},projection,(err,profile)=>{
        if(err || !profile){
            callback();
            return;
        }
        callback(profile);
    })
}

/**
 * update given user's profile
 * @param  userId 
 * @param  projection 
 * @param  callback 
 */
function updateProfile(userId,update,callback){
    model.ProfileSchema.findOneAndUpdate({userId:userId},update,(err,doc,res)=>{
        if(err || !doc){
            callback();
        }else{
            callback(doc);
        }
    });
}

module.exports.getHeadlines = getHeadlines;
module.exports.updateHeadline = updateHeadline;
module.exports.putEmail = putEmail;
module.exports.getProfile = getProfile;
module.exports.putProfile = putProfile;
module.exports.getEmail = getEmail;
module.exports.putZipcode = putZipcode;
module.exports.getZipcode = getZipcode;
module.exports.getDob = getDob;
module.exports.getAvatars = getAvatars;
module.exports.putAvatar = putAvatar;
module.exports.putPassword = putPassword;