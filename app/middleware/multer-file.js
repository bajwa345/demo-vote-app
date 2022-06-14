const multer = require('multer');

const MIME_TYPE_MAP = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid){
            error = null;
        }
       // error = null;
        cb(error, "requestsFiles");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null,name + '-' + Date.now() +'.'+ ext);
    }
});

module.exports = multer({storage: storage}).array("firDoc[]",3);