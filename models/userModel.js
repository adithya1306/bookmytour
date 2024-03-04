/* eslint-disable */

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true,'Please enter your email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user','guide','admin','lead-guide'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    //unique: true,
    trim: true,
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    trim: true,
    validate: {
      // Works only on CREATE and SAVE !!
      validator: function(i) {
        return i === this.password; 
      },
      message: 'The passwords donot match'
    },
    select: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date
});

// Password Encryption Middleware
userSchema.pre('save',async function(next) {
  // ONLY RUN IF THE PASSWORD IS MODIFIED 
  if(!this.isModified('password')){
    return next();
  }
  // Hashing the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = this.password;
  
  next();
})

userSchema.methods.correctPassword = async function(password,userPassword) {
  return await bcrypt.compare(password,userPassword);
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 100 * 60 * 1000;
  return resetToken;  
}

const User = mongoose.model('User', userSchema);
module.exports = User;