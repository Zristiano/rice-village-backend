const fetch = require('isomorphic-fetch');
const url = path => `https://ricebookserver-yuanmengzeng.herokuapp.com${path}`;
describe('test article',()=>{
    it('should validate GET /articles', (done)=> {
        fetch(url('/login'),{
            method:"POST",
            body:JSON.stringify({username:"Zristiano",password:"1234"}),
            headers:{
                "Content-Type":"application/json",
            },
            credentials:'include'
        }) .then(res=>{
            const setCookie = res.headers.get('set-cookie');
            const cookie = setCookie.substr(0,setCookie.indexOf(';'));
            fetch(url('/articles/'),{
                method:"GET",
                headers:{
                    "Content-Type":"application/json",
                    Cookie:cookie
                },
                credentials:'include'
            }).then(res=>{
                expect(res.status).toEqual(200);
                return res.json();
            }).then(res=>{
                expect(res.errorCode).toEqual(0);
                done();
            })
        });
    });

    it('should validate GET /articles/id', (done)=> {
        fetch(url('/login'),{
            method:"POST",
            body:JSON.stringify({username:"Zristiano",password:"1234"}),
            headers:{
                "Content-Type":"application/json",
            },
            credentials:'include'
        }) .then(res=>{
            const setCookie = res.headers.get('set-cookie');
            const cookie = setCookie.substr(0,setCookie.indexOf(';'));
            fetch(url('/articles/10000000'),{
                method:"GET",
                headers:{
                    "Content-Type":"application/json",
                    Cookie:cookie
                },
                credentials:'include'
            }).then(res=>{
                expect(res.status).toEqual(200);
                return res.json();
            }).then(res=>{
                expect(res.errorCode).toEqual(0);
                expect(res.result.length).toEqual(1);
                console.log('articles->'+JSON.stringify(res));
                done();
            })
        });
    });

    it('should validate post /article', (done)=> {
        fetch(url('/login'),{
            method:"POST",
            body:JSON.stringify({username:"Zristiano",password:"1234"}),
            headers:{
                "Content-Type":"application/json",
            },
            credentials:'include'
        }) .then(res=>{
            const setCookie = res.headers.get('set-cookie');
            const cookie = setCookie.substr(0,setCookie.indexOf(';'));
            fetch(url('/article'),{
                method:"POST",
                body:JSON.stringify({text:"Zristiano new Post "+Date.now()}),
                headers:{
                    "Content-Type":"application/json",
                    Cookie:cookie
                },
                credentials:'include'
            }).then(res=>{
                expect(res.status).toEqual(200);
                return res.json();
            }).then(res=>{
                expect(res.errorCode).toEqual(0);
                done();
            })
        });
    });
})

describe('test Auth',()=>{
    it('validate POST /login', (done)=> {
        fetch(url('/login'),{
            method:"POST",
            body:JSON.stringify({username:"Zristiano",password:"1234"}),
            headers:{
                "Content-Type":"application/json",
            },
            credentials:'include'
        }) .then(res=>{
                expect(res.status).toEqual(200);
                return res.json();}).then(res=>{
                expect(res.errorCode).toEqual(0);
                done();
            })
        });


    it('should validate PUT /logout', (done)=> {
        fetch(url('/login'),{
            method:"POST",
            body:JSON.stringify({username:"Zristiano",password:"1234"}),
            headers:{
                "Content-Type":"application/json"
            },
            credentials:'include'
        }) .then(res=>{
            const setCookie = res.headers.get('set-cookie');
            const cookie = setCookie.substr(0,setCookie.indexOf(';'));
            fetch(url('/logout'),{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    Cookie:cookie
                },
                credentials:'include'
            }).then(res=>{
                expect(res.status).toEqual(200);
                return res.json();
            }).then(res=>{
                expect(res.errorCode).toEqual(0);
                done();
            });
        });
    });

    it('validate POST /register', (done)=> {
        const newUsername = "Zristiano24";
        fetch(url('/register'),{
            method:"POST",
            body:JSON.stringify({username:newUsername,
                                password:"1234",
                                phone:"789-123-1234",
                                email:"fdsff@yui.com",
                                dob:"1511000926786",
                                zipCode:"12312"
            }),
            headers:{
                "Content-Type":"application/json",
            },
            credentials:'include'
        }) .then(res=>{
            expect(res.status).toEqual(200);
            return res.json();}).then(res=>{
            expect(res.errorCode).toEqual(0);
            expect(res.username).toEqual(newUsername);
            done();
        })
    });
});


describe('test Profile',()=>{
    it('should validate GET /headlines', (done)=> {
        fetch(url('/login'),{
            method:"POST",
            body:JSON.stringify({username:"Zristiano7",password:"1234"}),
            headers:{
                "Content-Type":"application/json",
            },
            credentials:'include'
        }) .then(res=>{
            const setCookie = res.headers.get('set-cookie');
            const cookie = setCookie.substr(0,setCookie.indexOf(';'));
            fetch(url('/headlines/'),{
                method:"GET",
                headers:{
                    "Content-Type":"application/json",
                    Cookie:cookie
                },
                credentials:'include'
            }).then(res=>{
                expect(res.status).toEqual(200);
                return res.json();}).then(res=>{
                expect(res.headlines[0].headline).toEqual("I am Zristiano7");
                done();
            })
        });
    });

    it('should validate PUT /headline', (done)=> {
        fetch(url('/login'),{
            method:"POST",
            body:JSON.stringify({username:"Zristiano",password:"1234"}),
            headers:{
                "Content-Type":"application/json"
            },
            credentials:'include'
        }) .then(res=>{
            const setCookie = res.headers.get('set-cookie');
            const cookie = setCookie.substr(0,setCookie.indexOf(';'));
            fetch(url('/headline/'),{
                method:"PUT",
                body:JSON.stringify({headline:"I am Zrisitano"}),
                headers:{
                    "Content-Type":"application/json",
                    Cookie:cookie
                },
                credentials:'include'
            }).then(res=>{
                expect(res.status).toEqual(200);
                return res.json();
                }).then(res=>{
                    expect(res.errorCode).toEqual(0);
                    expect(res.result.headline).toEqual("I am Zrisitano");
                    done();
                });
            });
        });
});