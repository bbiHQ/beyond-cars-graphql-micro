const mongoose = require('mongoose');

var schema = new mongoose.Schema({
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
  if (mongoose.models.CarMake) {
    return mongoose.model('CarMake')
  } else {
    return mongoose.model('CarMake', schema, 'CarMakes');
  }
}

module.exports = getModel()