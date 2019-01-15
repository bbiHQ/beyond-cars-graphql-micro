const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

var schema = new mongoose.Schema({
  carModelId: ObjectId,
  carMakeId: ObjectId,
  slug: String,
  name: Array,
  niceName: Array,
  alias: Array,
  description: Array,
  url: Array,
  colors: Array,
  images: {
    thumbnail: String,
    bwThumbnail: String,
    banner: String,
    front: String,
    back: String,
    left: String,
    right: String,
    top: String,
    innerFrontLeft: String,
    innerFrontRight: String,
    innerBackLeft: String,
    innerBackRight: String
  },
  bodyType: String,
  years: [Number],
  trim: Array,
  doorCount: Number,
  wheelCount: Number,
  drivetrainType: String,
  transmissionType: String,
  fuelType: String,
  seo: {
    title: Array,
    description: Array,
    keywords: Array,
    image: Array
  },
  meta: {
    createdAt: Date,
    updatedAt: Date,
    publishAt: Date,
    unpublishAt: Date,
    deletedAt: Date
  }
});

const getModel = () => {
  if (mongoose.models.CarTrim) {
    return mongoose.model('CarTrim')
  } else {
    return mongoose.model('CarTrim', schema, 'CarTrims');
  }
}

module.exports = getModel()