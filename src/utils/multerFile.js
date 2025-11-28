const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('./appError');

const isVercel = process.env.VERCEL;
const uploadDir = isVercel ? '/tmp/temp' : 'uploads/temp';

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `import-${Date.now()}-${file.originalname}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new AppError('Not a CSV file! Please upload only CSV files.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadCsv = upload.single('file');
