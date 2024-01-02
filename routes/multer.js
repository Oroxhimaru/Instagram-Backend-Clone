const multer = require('multer');
const { v4: uuidv4 } = require("uuid"); //v4 = version 4
const path = require('path');


const storage = multer.diskStorage({
    destination: function(req, file, cb){   //cb is callback
        cb(null, "./public/images/uploads") //destination folder for  uploads
    },
    filename: function(req,file,cb){
        const uniqueFilename = uuidv4(); //generate a unique filename using uuid
        cb(null, uniqueFilename+path.extname(file.originalname)); //use the unique filename  for the uploaded file and +path.extname(file.originalname) this is for file original extension
    }
});

const upload = multer({ storage: storage });

module.exports = upload;