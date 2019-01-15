const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

var schema = new mongoose.Schema({
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

  },
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
  if (mongoose.models.CarModel) {
    return mongoose.model('CarModel')
  } else {
    return mongoose.model('CarModel', schema, 'CarModels');
  }
}

module.exports = getModel()