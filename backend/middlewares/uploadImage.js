const multer = require("multer");

// Configure storage settings for multer
const storage = multer.diskStorage({
  // Set destination directory for uploaded files
  destination: function (req, res, cb) {
    cb(null, "./uploads/"); // Save files to the 'uploads' directory
  },
  // Define filename for uploaded files
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + file.originalname); // Generate a unique filename using field name and timestamp
  },
});

// Define a file filter function for multer
const filerFilter = (req, file, cb) => {
  // Accept all files for now
  cb(null, true);
};

// Configure multer with storage and file filter settings
let upload = multer({
  storage: storage, // Use the configured storage settings
  fileFilter: filerFilter, // Use the configured file filter function
});

module.exports = upload.single("avatar");
