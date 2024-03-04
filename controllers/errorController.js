/* eslint-disable */

const AppError = require('./../utils/appError');

const handleJWTError = err => new AppError('Invalid Token. Please login again',"401");

const handleJWTExpiredError = err => new AppError('Your Token has expired! Please login again!','401');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  console.log('in db method');
  return new AppError(message,400);
}

const handleDuplicateFieldsDB = err => {
  console.log(err.keyValue);
  const message = `You are trying to insert a duplicate value : ${err.keyValue.name}`;
  return new AppError(message,400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(i => i.message);

  const message = `Invalid Input Data : ${errors.join(', ')}`;
  return new AppError(message,400);
}

const sendErrorDev = (err,res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err,res) => {
  // checking if it is a operational error 
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  // unknown or programming error that need not be sent to the client
  } else{
    console.log("ERROR : ",err.name);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong'
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if(process.env.NODE_ENV === 'production'){
    let error = { ...err };
  
    if(error.name === 'JsonWebTokenError'){
      error = handleJWTError(error);
    }if (error.name === 'TokenExpiredError'){
      error = handleJWTExpiredError(error);
    }else if(error.name === 'MongoError' && error.code === 11000){
      error = handleDuplicateFieldsDB(error);
    }else if(error.errors && String(error.errors.name).includes("ValidatorError") === true){
      console.log("hello");
      error = handleValidationErrorDB(error);
    }else if(error.messageFormat == undefined){
      error = handleCastErrorDB(error);
    }
    
    sendErrorProd(error,res);
  }else{
    sendErrorDev(err,res);
  }
};