const multer = require('multer');

////// MULTER - MANTER ESSE CÓDIGO
const storage = multer.diskStorage({
    destination: './uploads/',
    filename(req, file, cb) {
        if(file !== undefined){
            cb(null, new Date().toISOString()+'-'+file.originalname);
        }
    },
});

 const upload = multer({
    storage: storage,
    limits:{ fileSize: 1024 * 1024 * 5 },
 });

 module.exports = upload;