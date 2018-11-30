////////////////////////////////
// Upload files to Cloudinary //
////////////////////////////////
const multer = require('multer')
const stream = require('stream')
const cloudinary = require('cloudinary')

if (!process.env.CLOUDINARY_URL) {
    console.error('*******************************************************************************')
    console.error('*******************************************************************************\n')
    console.error('You must set the CLOUDINARY_URL environment variable for Cloudinary to function\n')
    console.error('\texport CLOUDINARY_URL="cloudinary:// get value from heroku"\n')
    console.error('*******************************************************************************')
    console.error('*******************************************************************************')
    process.exit(1)
}

console.log("CLOUDINARY_URL->"+process.env.CLOUDINARY_URL);

function uploadImage(req,res,next){
    multer().single('image')(req,res,()=>{
        if(!req.file){
            console.log('no req file');
            req.body.image = '';
            next();
            return;
        }
        console.log('have req file');
        const uploadStream = cloudinary.uploader.upload_stream(result => {    	
            console.log('result.url->'+result.url);
            if(result.url){
                req.body.image = result.url;
            }else{
                req.body.image = '';
            }
            next();
       });
   
       // multer can save the file locally if we want
       // instead of saving locally, we keep the file in memory
       // multer provides req.file and within that is the byte buffer
   
       // we create a passthrough stream to pipe the buffer
       // to the uploadStream function for cloudinary.
       const s = new stream.PassThrough()
       s.end(req.file.buffer)
       s.pipe(uploadStream)
       s.on('end', uploadStream.end)
    })
}

module.exports.uploadImage = uploadImage;

