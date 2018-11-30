const model = require('./model');
const Response = model.Response;

/**
 * get the following users' information of certain user
 * @param {request} req 
 * @param {response} res 
 */
function getFollowings(req,res){
    console.log('getFollowing');
    let userId = req.userId;
    if(req.params.userId){
        userId = req.params.userId;
    }
    model.ProfileSchema.findOne({userId:userId},{_id:0,following:1},(err,doc)=>{
        getUserProfile(doc.following,{_id:0,userId:1,username:1,avatar:1,headline:1},docs=>{
            console.log('getFollowing'+JSON.stringify(docs));
            res.status(200).send(new Response(0,'success',docs));
        });
    });
}

function getUserProfile(userIds, prejection,callback){
    model.ProfileSchema.find({userId:{$in:userIds}},prejection,(err,docs)=>{
        callback(docs);
    });
}

function addFollowing(req,res){
    const userId = req.userId;
    const followingName = req.params.userId;
    model.ProfileSchema.findOne({username:followingName},(err,doc)=>{
        if(!doc){
            res.status(200).send(new Response(2,'the user does not exist'));
            return;
        }
        const newFollowingId = doc.userId;
        if(userId===newFollowingId){
            console.log('userId===followingId');
            res.status(200).send(new Response(1,'you cannot follow yourself'));
            return;
        }
        model.ProfileSchema.findOne({userId:userId},(err, doc)=>{
            
            // find if the loggedin user has followed the followingId
            console.log('find if the loggedin user has followed the followingId');
            let id = doc.following.find(id=>{
                return id == newFollowingId;
            });
            if(id){
                res.status(200).send(new Response(3,'you have already followed the user before'));
                return;
            }
            doc.following.push(newFollowingId);
            doc.save();
            getUserProfile(doc.following,{_id:0,userId:1,username:1,avatar:1,headline:1},docs=>{
                res.status(200).send(new Response(0,'success', {username:doc.username,following:docs}));
            });
        })
    });
}


function unFollow(req,res){
    const userId = req.userId;
    const followingId = req.params.userId;
    console.log(`userId:${userId}  followingId:${followingId}`);
    if(userId==followingId){
        console.log('userId===followingId');
        res.status(200).send(new Response(1,'param illegal'));
        return;
    }
    model.ProfileSchema.findOne({userId:userId},(err, doc)=>{
        console.log('doc following:'+JSON.stringify(doc.following));
        for(let i= 0; i<doc.following.length; i++){
            if(doc.following[i]==followingId){
                doc.following.splice(i,1);
                break;
            }
        }
        console.log('doc following:'+JSON.stringify(doc.following));
        doc.save();
        getUserProfile(doc.following,{_id:0,userId:1,username:1,avatar:1,headline:1},docs=>{
            console.log('docs:'+JSON.stringify(docs));
            res.status(200).send(new Response(0,'success', {username:doc.username,following:docs}));
        });
    });
}
module.exports.getFollowings = getFollowings;
module.exports.addFollowing = addFollowing;
module.exports.unFollow = unFollow;