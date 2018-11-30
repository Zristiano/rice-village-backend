// console.log(module);
// var logger = require('./logger')
// console.log(logger);
// logger('hello world');
// logger.log(logger.getUrl());

/***  path
const path = require('path');
var pathObj = path.parse(__filename);
console.log(pathObj);
 */

 /**  os 
 const os = require('os');
 console.log(`free mem: ${os.freemem()},  total mem:${os.totalmem()}`);
 */

 /** fs 
 const fs = require('fs');
 // avoid use synchoronous method
 var files = fs.readdirSync('./');
console.log(files);
fs.readdir('./',function(err, files){
    if(err) console.log('erro',err);
    else console.log('result',files);
});
*/

/** events */
// a class 
const EventEmitter = require('events');
var eventEmittert = new EventEmitter(); 

// register a listener  eventEmitter.on()/eventEmitter.addListener()
// must defined before the emit function
eventEmittert.on('messageLogged', function(arg){ 
    console.log('listener called',arg);
});

// Raise an event,   event name : messageLogged
// eventEmittert.emit('messageLogged',{id:1,url:'http://'}); 

const Logger = require('./logger')
const logger = new Logger();
logger.addListener('messageLogged',(arg)=>{
    console.log('listener called',arg);
});
logger.log('new msg');