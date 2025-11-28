const multer = require('multer');
const path = require('path');
const AppError = require('./appError');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/covers');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `book-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadBookCover = upload.single('coverImage');

exports.resizeBookCover = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `book-${req.user.id}-${Date.now()}.jpeg`;

  // TODO: Implement image resizing if needed (e.g., with sharp)

  next();
};
