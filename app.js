/* eslint-disable */
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1. Middlewares

if (process.env.NODE_ENV == 'development'){
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req,res,next) => {
  req.requestTime = new Date().toISOString();
  next();
})

// Mounting the routes

app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.all('*', (req,res,next) => {
  next(new AppError(`cannot find ${req.originalUrl}`, 404));
})

// Middleware for Error Handling - err specified means its a error handlind middleware

app.use(globalErrorHandler);

module.exports = app;
