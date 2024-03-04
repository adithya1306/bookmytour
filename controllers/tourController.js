/* eslint-disable */
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

// Top Tours Aliasing using a middleware
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage';
  next();
}

exports.getAllTours = catchAsync(async (req, res,next) => {
  // Execution
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    //.limit()
    //.paginate();
  
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    data: {
      tourList: tours
    }
  })
});

exports.getTour = catchAsync(async (req, res,next) => {
  const tourId = await Tour.findById(req.params.id);
  //console.log(tourId);

  if(!tourId){
    return next(new AppError('No such tour found',"404"));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tourId
    }
  });
})



exports.createTour = catchAsync(async (req, res,next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
})

exports.updateTours = catchAsync(async (req, res,next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if(!tour){
    return next(new AppError('No such tour found',"404"));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
})

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if(!tour){
    return next(new AppError('No such tour found',"404"));
  }

  res.status(200).json({
    status: "deletion success"
  });
})

exports.getTourStats = catchAsync(async (req,res,next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: {$gte : 4.5} }
    },
    {
      $group: {
        _id: {$toUpper: '$difficulty'},
        numberofTours: {$sum: 1},
        avgRating: {$avg: '$ratingsAverage'},
        avgPrice: {$avg: '$price'},
        minPrice: {$min: '$price'},
        maxPrice: {$max: '$price'}
      }
    },
    {
      $sort: {
        avgPrice: 1
      }
    }
  ])

  if(!stats){
    return next(new AppError('No such tour found',"404"));
  }

  res.status(200).json({
    message: 'success',
    data: stats
  })
})

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      }
    },
    {
      $group: {
        _id: {$month : '$startDates'},
        numTourStarts: { $sum: 1},
        tours: { $push: '$name'}
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    }
  ]);

  res.status(200).json({
    message: 'success',
    data: {
      plan
    }
  });
})  

exports.bookTour = catchAsync(async (req,res,next) => {
  const tourId = await Tour.findById(req.params.id);
  const tourName = tourId.name;
  const duration = tourId.duration;
  const ratingAverage = tourId.ratingsAverage;

  const message = `Details: \n \n Tour Name : ${tourName} \n Duration : ${duration} \n Average Rating : ${ratingAverage} \n Tour Guide : Harinarayanan \n Tour Guide Contact Number : 965264734 \n \n Have a happy and safe tour! Thanks for booking with us \n \n With love, \n Team BookMyTour`;

  if(!tourId){
    return next(new AppError('No such tour found',"404"));
  }

  try{
    const res = await sendEmail({
      email: req.body.email,
      subject: `Congratulations on successfully booking your tour!`,
      text: message
    });
    console.log(res);
  }catch(err){
    console.log(err);
  }

  res.status(201).json({
    status: 'success',
    message: 'mail sent successfully'
  });
});