require('./db')
const express = require('express');
const app = express();
// require('./uploadCloudinary').setup(app);
app.use(express.json());
// app.use(cookieParser());
app.use(enableCROS);


function enableCROS(req, res, next) {
    res.header('Access-Control-Allow-Origin',req.headers.origin);
    res.header('Access-Control-Allow-Credentials',true);
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers','Authorization, Content-Type');
    if (req.method === 'OPTIONS')
    {
        res.sendStatus(200);
        return;
    }
    next();
}



app.get('/',(req,res)=>{
    res.send('hello world');
})

app.get('/app',(req,res)=>{
    res.send('hello app');
})

// http://localhost:8888/app/23/Houton?id=45&city=Houston
app.get('/app/:id/:city',(req,res)=>{
    console.log(req.params); // { id: '45', city: 'Houston' }
    res.send(req.params.city+ ' '+ req.params.id);
})

const courses = [
    {id:1,course:"course1"},
    {id:2,course:"course2"},
    {id:3,course:"course3"},
]

app.get('/course/:id',(req,res)=>{
    const course = courses.find((value,idx,obj)=>{
        console.log(`value:${JSON.stringify(value)}   idx:${idx}   obj:${JSON.stringify(obj)}`);
        if(value.id === parseInt(req.params.id)){
            return true;
        }
        return false;
    })
    if(course){
        res.status(200).send(course);
    }else{
        res.status(404).send("cannot find course");
    }
    res.end();
    
})

app.put('/course/:id',(req,res)=>{
    // look up the course
    // if not existing, return 404

    //if invalid, return 400 - Bad request

    //if valid, return the updated course
});

const auth = require('./auth');
const profile = require('./profile');
const following = require('./following');
const article = require('./article');
const uploadImage = require('./uploadImage');
app.post('/login', auth.login);
app.post('/register', auth.register);

app.get('/headlines/:userIds?',auth.isLoggedIn , profile.getHeadlines);
app.put('/headline', auth.isLoggedIn ,profile.updateHeadline);
app.get('/profile',auth.isLoggedIn,profile.getProfile);
app.put('/profile',auth.isLoggedIn,profile.putProfile);
app.get('/following/:userId?',auth.isLoggedIn,following.getFollowings);
app.put('/following/:userId',auth.isLoggedIn,following.addFollowing);
app.delete('/following/:userId',auth.isLoggedIn,following.unFollow);
app.get('/articles/:ids?',auth.isLoggedIn,article.getArticles);
app.post('/article',auth.isLoggedIn, uploadImage.uploadImage,article.postArticle);
app.put('/articles/:id',auth.isLoggedIn,article.updateArticle);
app.put('/logout',auth.isLoggedIn,auth.logout);
app.get('/email/:userId?',auth.isLoggedIn,profile.getEmail);
app.put('/email', auth.isLoggedIn,profile.putEmail);
app.get('/zipcode/:userId?',auth.isLoggedIn,profile.getZipcode);
app.put('/zipcode', auth.isLoggedIn,profile.putZipcode);
app.get('/dob/:userId?', auth.isLoggedIn,profile.getDob);
app.put('/avatar', auth.isLoggedIn, uploadImage.uploadImage, profile.putAvatar);
app.get('/avatar/:userIds?', auth.isLoggedIn,profile.getAvatars);
app.put('/password', auth.isLoggedIn,profile.putPassword);
app.put('/linkaccount', auth.isLoggedIn,auth.linkAccount);
app.put('/unlinkfacebook', auth.isLoggedIn,auth.unlinkFacebook);
app.get('/userstate', auth.isLoggedIn,auth.userState);

app.get('/login/facebook',auth.passport.initialize(),auth.passport.authenticate('facebook',{session:false,scope:['email']}));
app.get('/facebook_callback',auth.passport.initialize(),auth.loginWithFacebook);    
app.get('/linkfacebook',auth.isLoggedIn,auth.passport.initialize(),auth.passport.authenticate('facebook',{session:false,scope:['email']}));








const port = process.env.PORT ||3000;
app.listen(port,()=>console.log(`listening on port ${port}...`));

