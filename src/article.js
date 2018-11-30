const model = require('./model');
const Response = model.Response;


function articlieObj(articleId, user, image, timeStamp, content, comments){
    let article = {
        articleId : articleId,
        author : user,
        image : image,
        timeStamp : timeStamp,
        content : content,
        commentIds : comments,
    }
    return article;
}

function commentObj(cmts){
    let comments = [];
    for(let i=0; i<cmts.length; i++){
        let comment = {
            userId:cmts[i].userId,
            commentId:cmts[i].commentId,
            content:cmts[i].content,
            timeStamp:cmts[i].timeStamp
        }
        comments.push(comment);
    }
    return comments;
}

function updateArticle(req,res){
    const articleId = req.params.id;
    if(!req.body.text){
        res.status(400).send('text field is required');
        return;
    }
    const newCotent = req.body.text;
    model.ArticleSchema.findOne({articleId:articleId},(err,article)=>{
        if(err || !article){
            res.status(200).send(new Response(1,'no article corresponding with articleId '+articleId));
            return;                
        }
        // no commentId, update the article's content
        if(!req.body.commentId){
            if(article.userId!=req.userId){
                res.status(200).send(new Response(2,'only author can update the article'));
                return;   
            }
            article.content = newCotent;
            console.log('article->'+JSON.stringify(article));
            article.timeStamp = Date.now();
            article.save((err, product)=>{
                console.log('product->'+product);
                getCertainArticle(articleId,articles=>{
                    if(articles){
                        res.status(200).send(new Response(0,'success',articles));
                    }else{
                        res.status(200).send(new Response(1,'server error'));
                    }
                });
            });
            return;
        }
        const commentId = req.body.commentId;
        if(commentId>0){
            let hasComment = false; ;
            for(let i =0 ; i<article.comments.length;i++){
                if(article.comments[i]===commentId){
                    hasComment = true;
                    break;
                }
            }
            if(!hasComment){
                res.status(200).send(new Response(3,'the updating comment does not belong to article '+articleId));
                return;
            }
            model.CommentSchema.findOneAndUpdate({commentId:commentId},{content:newCotent,timeStamp:Date.now()},(err,doc)=>{
                getCertainArticle(articleId,articles=>{
                    if(articles){
                        res.status(200).send(new Response(0,'success',articles));
                    }else{
                        res.status(200).send(new Response(2,'server error'));
                    }
                })
            });
            return;
        }
        model.IDCounterSchema.findOne((err,idCounter)=>{
            const newCommentId = idCounter.commentId;
            new model.CommentSchema({commentId:newCommentId,userId:req.userId,content:newCotent,timeStamp:Date.now()}).save((err,doc)=>{
                idCounter.commentId++;
                idCounter.save();
                article.comments.push(newCommentId);
                article.save((err,product)=>{
                    getCertainArticle(articleId, articles=>{
                        if(articles){
                            res.status(200).send(new Response(0,'success',articles));
                        }else{
                            res.status(200).send(new Response(3,'server error'));
                        }
                    })
                });
            });
        });
    });
    
}

function postArticle(req,res){
    console.log("postArticle====");
    console.log(req.body);
    // console.log(req);
    if(!req.body.text){
        res.status(400).send('text field is required');
        return;
    }
    const content = req.body.text;
    const image = req.body.image;
    model.IDCounterSchema.findOne((err,idDoc)=>{
        let articleId = idDoc.articleId;
        let timeStamp = Date.now();
        idDoc.articleId++;
        idDoc.save();
        new model.ArticleSchema({articleId:articleId, userId:req.userId, image:image, timeStamp:timeStamp, content:content, comments:[]}).save();
        model.ProfileSchema.findOne({userId:req.userId},{_id:0,userId:1,username:1,avatar:1},(err,profile)=>{
            let article = articlieObj(articleId,profile,image,timeStamp,content,[]);
            res.status(200).send(new Response(0,'success',article));
        });
    });
}

/**
 * request articles used for endpoint /articles/:id?
 * @param {request} req 
 * @param {response} res 
 */
function getArticles(req,res){
    let ids;
    console.log("getArticles ==== ");
    console.log(req.params.ids);
    if(req.params.ids){
        console.log("params.ids->"+req.params.ids);
        const idStrings = req.params.ids.split(",");
        console.log("idStrings->"+idStrings);
        ids = [];
        idStrings.forEach(idString=>{
            const parsedId = parseInt(idString);
            if(!isNaN(parsedId)){
                ids.push(parseInt(idString));
            }
        });
    }
    console.log("ids->"+ids);
    let cnt = 10;
    let np = 0;
    if(req.params.cnt){
        cnt = req.params.cnt;
    }
    if(req.params.np){
        np = req.params.np;
    }

    // no specific id or id is commentId
    if(!ids || ids[0]>=10000){
        ids = [parseInt(req.userId)];
    }

    //article id
    if(ids[0]>=10000000){
        getCertainArticle(ids[0],(articles)=>{
            if(articles){
                res.status(200).send(new Response(0,'success',articles));
            }else{
                res.status(200).send(new Response(4,'server error'));
            }
        });
        return;
    }
    
    console.log('getArticles id->'+ids);
    getUserArticles(ids,cnt,np,(articles)=>{
        if(articles){
            res.status(200).send(new Response(0,'success',articles));
        }else{
            res.status(200).send(new Response(5,'server error'));
        }
    });
}

/**
 * get an article accoring to the given articleId
 * @param {articleId} articleId 
 * @param {callback} callback 
 */
function getCertainArticle(articleId,callback){
    // new model.ArticleSchema().save();
    model.ArticleSchema.findOne({articleId:articleId},(err,doc)=>{
        if(err||!doc){
            // console.log("getCertainArticle err->"+JSON.stringify(err));
            callback();
            return;
        }
        // console.log("getCertainArticle->"+JSON.stringify(doc));
        model.ProfileSchema.findOne({userId:doc.userId},{_id:0,userId:1,username:1,avatar:1},(err,profile)=>{
            if(err|| !profile){
                callback();
                return;
            }
            // console.log("getCertainArticle  profile->"+JSON.stringify(profile));
            let article = articlieObj(doc.articleId,profile,doc.image,doc.timeStamp,doc.content,doc.comments);
            // console.log("getCertainArticle  article->"+JSON.stringify(article));
            let articles = [article];
            // console.log("getCertainArticle  articles->"+JSON.stringify(articles));
            getCommentDetail(articles,callback);
        });
    });
}

/**
 * get certain user's article feeds
 * @param {userIds} userIds 
 * @param {np} np start of next article
 * @param {cnt} cnt number of articles which should return to front-end
 * @param {callback} callback 
 */
function getUserArticles(userIds,cnt,np,callback){
    model.ProfileSchema.find({userId:{$in:userIds}},{_id:0,userId:1,username:1,avatar:1},(err,profiles)=>{
        if(err||!profiles){
            callback();
            return;
        }
        let projection = null;
        if(np>0){
            projection = {
                timeStamp:{$lt:np}
            };
        }
        // search articles in descending order of timeStamp
        model.ArticleSchema.find({userId:{$in:userIds}},projection,{limit:cnt,sort:{timeStamp:-1}},(err,docs)=>{
            if(err||!docs){
                callback();
                return;
            }
            // console.log("getUserArticles->"+JSON.stringify(docs));
            let articles = [];
            for(let i=0; i<docs.length; i++){
                const profile = profiles.find(p=> p.userId===docs[i].userId);
                articles.push(articlieObj(docs[i].articleId,profile,docs[i].image,docs[i].timeStamp,docs[i].content,docs[i].comments))
            }
            getCommentDetail(articles,callback);
        });
    });
    
}

/**
 * find the details of the article's author and comments
 * @param {the array of articles} articles 
 * @param {callback} callback 
 */
function getCommentDetail(articles,callback){
    let commentSum = 0;
    for(let i=0; i<articles.length; i++){
        commentSum+= articles[i].commentIds.length;
    }
    if(commentSum===0){
        callback(articles);
        return;
    }
    console.log("commentSum---------->"+commentSum);
    let commentCount = 0;
    articles.forEach(article => {
        model.CommentSchema.find({commentId:{$in:article.commentIds}}, (err,comments)=>{
            if(err||!comments){
                callback();
                return;
            }
            article.comments = commentObj(comments);
            article.comments.forEach(comment=>{
                model.ProfileSchema.findOne({userId:comment.userId},{_id:0,userId:1,username:1,avatar:1},(err,profile)=>{
                    if(err||!profile){
                        callback();
                        return;
                    }
                    commentCount++;
                    comment.author = profile;
                    if(commentCount===commentSum){
                        callback(articles);
                        return;
                    }
                });
            });
        });
    });
}

module.exports.updateArticle = updateArticle;
module.exports.getArticles = getArticles;
module.exports.postArticle = postArticle;
