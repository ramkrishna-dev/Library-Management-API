const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { createSendToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');

exports.register = catchAsync(async (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed: User.email')) {
        return next(new AppError('Email already registered!', 400));
      }
      return next(new AppError('Could not register user!', 500));
    }
    createSendToken(user, 201, res);
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  User.findByEmail(email, async (err, user) => {
    if (err) return next(new AppError('Error finding user!', 500));

    if (!user) {
      return next(new AppError('Incorrect email or password!', 401));
    }

    User.comparePasswords(password, user.password, (err, isMatch) => {
      if (err) return next(new AppError('Error comparing passwords!', 500));
      
      if (!isMatch) {
        return next(new AppError('Incorrect email or password!', 401));
      }

      createSendToken(user, 200, res);
    });
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.jwt;

  if (!refreshToken) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return next(new AppError('Invalid refresh token. Please log in again!', 401));
    }

    User.findById(decoded.id, (err, user) => {
      if (err) return next(new AppError('Error finding user!', 500));
      if (!user) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }

      const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.status(200).json({
        status: 'success',
        accessToken: newAccessToken,
      });
    });
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  User.update(req.user.id, req.body, (err, result) => {
    if (err) return next(new AppError('Error updating profile!', 500));
    if (result.changes === 0) return next(new AppError('No changes made or user not found!', 404));
    
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully!',
    });
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  if (!currentPassword || !newPassword || !passwordConfirm) {
    return next(new AppError('Please provide current password, new password, and password confirmation!', 400));
  }

  if (newPassword !== passwordConfirm) {
    return next(new AppError('New password and confirmation password do not match!', 400));
  }

  User.findById(req.user.id, (err, user) => {
    if (err) return next(new AppError('Error finding user!', 500));
    if (!user) return next(new AppError('User not found!', 404));

    User.comparePasswords(currentPassword, user.password, (err, isMatch) => {
      if (err) return next(new AppError('Error comparing passwords!', 500));
      if (!isMatch) {
        return next(new AppError('Your current password is incorrect!', 401));
      }

      User.updatePassword(req.user.id, newPassword, (err, result) => {
        if (err) return next(new AppError('Error updating password!', 500));
        res.status(200).json({
          status: 'success',
          message: 'Password updated successfully!',
        });
      });
    });
  });
});
