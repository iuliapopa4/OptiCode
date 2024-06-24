const fs = require("fs");

// Middleware function to handle file uploads
module.exports = (req, res, next) => {
  // Check if file or body is undefined
  if (typeof req.file === "undefined" || typeof req.body === "undefined") {
    return res.status(400).json({ msg: "Issue with uploading this image." });
  }

  let image = req.file.path;

  // Check if the file type is supported
  if (
    !req.file.mimetype.includes("jpeg") &&
    !req.file.mimetype.includes("jpg") &&
    !req.file.mimetype.includes("png")
  ) {
    // Delete the invalid file
    fs.unlinkSync(image);
    return res.status(400).json({ msg: "This file is not supported." });
  }

  // Check if the file size is within the limit (1MB)
  if (req.file.size > 1024 * 1024) {
    // Delete the oversized file
    fs.unlinkSync(image);
    return res.status(400).json({ msg: "This file is too large (Max: 1MB)" });
  }

  // If all checks pass, proceed to the next middleware or route handler
  next();
};
