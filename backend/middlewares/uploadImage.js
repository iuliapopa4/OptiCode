const multer = require("multer");

const storage = multer.diskStorage({
  // Set destination directory for uploaded files
  destination: function (req, res, cb) {
    cb(null, "./uploads/");
  },
  // Define filename for uploaded files
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + file.originalname);
  },
});


const filerFilter = (req, file, cb) => {
  // Accept all files for now
  cb(null, true);
};

// Configure multer with storage and file filter settings
let upload = multer({
  storage: storage,
  fileFilter: filerFilter,
});

module.exports = upload.single("avatar");