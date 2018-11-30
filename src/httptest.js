const http = require('http');

/** 
const server = http.createServer();
server.on('connection',(socket)=>{
    console.log('new connection');
})
*/
const server = http.createServer((request, response)=>{
    if(request.url === '/'){
        response.write('hello world');
        response.end();
    }else if(request.url === '/api/courses'){
        response.write(JSON.stringify([1,2,3]));
        response.end();
    }
})

server.listen(3000);