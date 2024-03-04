/* eslint-disable */
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'ValidatorError: tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40,'ValidatorError: The Tour name is too long - max 40 chars'],
    minlength: [10,'ValidatorError: The Tour name must be more than 10 chars']
  },
  duration: {
    type: Number,
    required: [true, 'ValidatorError: tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy','medium','difficulty']
  },
  ratingsNumber: {
    type: Number
  },
  ratingsAverage: {
    type: Number,
    default: 4.2,
    max: [5.0, "ValidatorError: Avg rating can't be above 5"]
  },
  price: {
    type: Number,
    required: [true, 'ValidatorError: tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: function(i) {
      return i < this.price;
    }
  },
  summary: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: true
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date]
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;