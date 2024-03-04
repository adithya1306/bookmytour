/* eslint-disable */

const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// const getAllUsers = (req,res) => {
//   res.status(200).json({
//     status: 'not available',
//     message: 'route not yet defined'
//   });
// }

// const createUser = (req,res) => {
//   res.status(200).json({
//     status: 'not available',
//     message: 'route not yet defined'
//   }); 
// }

// const getUser = (req,res) => {
//   res.status(200).json({
//     status: 'not available',
//     message: 'route not yet defined'
//   });
// }

// const updateUser = (req,res) => {
//   res.status(200).json({
//     status: 'not available',
//     message: 'route not yet defined'
//   });
// }

// const deleteUser = (req,res) => {
//   res.status(200).json({
//     status: 'not available',
//     message: 'route not yet defined'
//   });
// }

const router = express.Router();

router
  .post('/signup',authController.signup);

router
  .post('/login',authController.login);

router
  .post('/forgotPassword',authController.forgotPassword);

router
  .patch('/resetPassword/:token',authController.resetPassword);

router
  .patch('/updatePassword',authController.updatePassword);

// APIs that follow the REST Architecture
router
  .route('/')
  .get(authController.protect,authController.restrictTo('admin', 'lead-guide'),userController.getAllUsers)
  .post(authController.protect,authController.restrictTo('admin', 'lead-guide'),userController.createUser);

router
  .route('/:id')
  .get(authController.protect,authController.restrictTo('admin', 'lead-guide'),userController.getUser)
  .patch(authController.protect,authController.restrictTo('admin', 'lead-guide'),userController.updateUser)
  .delete(authController.protect,authController.restrictTo('admin', 'lead-guide'),userController.deleteUser);

module.exports = router;