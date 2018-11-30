// log(__dirname);
// log(__filename);
const EventEmitter = require('events');
var url = 'http://mylogger.io/log';
function log(message){
    console.log(message);
}

class Logger extends EventEmitter{
    log(message){
        console.log(message);
        this.emit('messageLogged',{id:1,url:'http://'});
    }
}


module.exports = Logger;
// module.exports.log = log;
// module.exports.getUrl = function(){
//     return url;
// }