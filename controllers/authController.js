/* eslint-disable */

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = function (id) {
  return jwt.sign({ id }, "adithya-has-a-really-good-secret-for-jwt", { expiresIn: "30d" });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const message = `Dear ${req.body.name}, \n\n        We wholeheartedly welcome you! \n\n Regards,\n Adithya B, \n Founder, BookMyTour`;
  try{
    const res = await sendEmail({
      email: req.body.email,
      subject: `Hello ${req.body.name}! Welcome to BookMyTour`,
      text: message
    });
    console.log(res);
  }catch(err){
    console.log(err);
  }

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password to login", 400));
  }
  // 2. check if password is correct - +password is used to select as password is select:false in model
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email or Password", "401"));
  }

  // 3. send the jwt back to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
})

// Middleware to authenticate users to access the protected info in routes
exports.protect = catchAsync(async (req, res, next) => {
  //1. Get the token - the JWT is added to http header with authorization : Bearer <token>
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError("You have to login to get access", "401"));
  }

  //2. Validate the token (Verification)
  const decoded = await promisify(jwt.verify)(token, "adithya-has-a-really-good-secret-for-jwt");

  const currentUser = await User.findById(decoded.id);
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are forbidden to perform this action', "403"));
    }
    next();
  }
}

exports.forgotPassword = catchAsync(async (req,res,next) => {
  // 1. Get user based on entered email
  const user = await User.findOne({email : req.body.email});
  if(!user) {
    return next(new AppError("No user found for the provided email","404"));
  }

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  

  // 3. Send back as email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password at ${resetURL}. \n If already reset, please ignore this email`;
  //console.log(resetToken);

  try{
    await sendEmail({
      email: user.email,
      subject: 'Your password is only valid for 10 minutes',
      text: message
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent successfully!'
    });
  } catch(err) {
    //user.passwordResetToken = undefined;
    //user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(resetToken);
    return next(new AppError("Mail could not be sent. Please try again"),"500");
  }
})

exports.resetPassword = catchAsync(async (req,res,next) => {
  // 1. Get the user based on the token
  //const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({passwordResetToken : req.params.token, passwordResetExpires: {$gt: Date.now()}});
  console.log(user);
  // 2. If token not expired, set new pass
  // 3. Update the changed password
  if(!user) {
    return next(new AppError('Token has expired','400'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
 
  // 4. Log the user in 
  const token = signToken(user._id);
  res.status(200).json({
    status: 'password was changed successfully',
    token
  });
})

exports.updatePassword = async (req,res,next) => {
  const email = req.body.email;
  const user = await User.findOne({ email }).select('+password');
  const password = user.correctPassword(req.body.password, user.password);

  if(!user){
    return next(new AppError('Please enter valid credentials','404'));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;

  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: 'Password Updated Successfully',
    token
  })

}