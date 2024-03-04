/* eslint-disable */

const express = require('express');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req,res,next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  });
})

exports.createUser = (req,res) => {
  res.status(200).json({
    status: 'not available',
    message: 'route not yet defined'
  });
}

exports.getUser = (req,res) => {
  res.status(200).json({
    status: 'not available',
    message: 'route not yet defined'
  });
}

exports.updateUser = (req,res) => {
  res.status(200).json({
    status: 'not available',
    message: 'route not yet defined'
  });
}

exports.deleteUser = (req,res) => {
  res.status(200).json({
    status: 'not available',
    message: 'route not yet defined'
  });
}