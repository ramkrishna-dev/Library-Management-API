const jwt = require('jsonwebtoken');

const signToken = (id, secret, expiresIn) => {
  return jwt.sign({ id }, secret, {
    expiresIn: expiresIn,
  });
};

const createSendToken = (user, statusCode, res) => {
  const accessToken = signToken(user.id, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
  const refreshToken = signToken(user.id, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_REFRESH_EXPIRES_IN.slice(0, -1) * 24 * 60 * 60 * 1000 // Convert '7d' to milliseconds
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', refreshToken, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    user,
  });
};

module.exports = { signToken, createSendToken };
