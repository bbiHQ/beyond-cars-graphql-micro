const ObjectId = require('mongoose').Types.ObjectId;
const _ = require('lodash');
const translate = require('./translate.js');

const CarMake = require('../graphqlSchema/CarMake/dbSchema.js');
const CarModel = require('../graphqlSchema/CarModel/dbSchema.js');
const CarTrim = require('../graphqlSchema/CarTrim/dbSchema.js');


const db = {
  carMake: {
    findOneById: (_id, includeDeleted = false) => {
      if (!ObjectId.isValid(_id)) {
        throw(`Invalid ObjectId ${_id}.`);
      }

      const query = {
        _id
      };

      if (includeDeleted === false) {
        query['meta.deletedAt'] = { $exists: false }
      }

      return CarMake.findOne(query);
    },

    findOneBySlug: (slug, includeDeleted = false) => {
      const query = {
        slug
      }

      if (includeDeleted === false) {
        query['meta.deletedAt'] = { $exists: false }
      }
      return CarMake.findOne(query);
    },

    findAll: (sort = {}) => {
      return CarMake.find({ 'meta.deletedAt': { $exists: false } }, null, {
        sort
      });
    },

    create: (record) => {
      return CarMake.create(record)
    },

    updateById: ({_id, updates}) => {
      if (!ObjectId.isValid(_id)) {
        throw(`Invalid ObjectId ${_id}.`);
      }

      return CarMake.updateOne({ _id, 'meta.deletedAt': { $exists: false } }, updates);
    },

    markAsDeletedById: async (_id) => {
      if (!ObjectId.isValid(_id)) {
        throw(`Invalid ObjectId ${_id}.`);
      }

      // TODO: delete CarTrim as well

      await CarTrim.updateMany({ carMakeId: _id, 'meta.deletedAt': { $exists: false } }, { 'meta.deletedAt': Date.now() });
      
      await CarModel.updateMany({ carMakeId: _id, 'meta.deletedAt': { $exists: false } }, { 'meta.deletedAt': Date.now() });

      return CarMake.updateOne({ _id, 'meta.deletedAt': { $exists: false } }, { 'meta.deletedAt': Date.now() })
    },

    translateRecord: (record, locale) => {
      if (_.isEmpty(record))
        return record;

      return Object.assign({}, record, {
        _localised: {
          locale: locale,
          name: translate(record.name, locale),
          niceName: translate(record.niceName, locale),
          alias: translate(record.alias, locale),
          description: translate(record.description, locale),
          url: translate(record.url, locale),
          colors: record.colors === undefined ? undefined : record.colors.map((color) => {
            return Object.assign({}, color, {
              name: translate(color.name, locale)
            })
          }),

          seo: {
            title: _.isEmpty(record.seo.title) ? "" : translate(record.seo.title, locale),
            description: _.isEmpty(record.seo.description) ? "" : translate(record.seo.description, locale),
            keywords: _.isEmpty(record.seo.keywords) ? "" : translate(record.seo.keywords, locale),
            image: _.isEmpty(record.seo.image) ? "" : translate(record.seo.image, locale)
          }
        }
      });
    }

  },


  carModel: {
    findOneById: (_id, includeDeleted = false) => {
      if (!ObjectId.isValid(_id)) {
        throw(`Invalid ObjectId ${_id}.`);
      }

      const query = {
        _id
      };

      if (includeDeleted === false) {
        query['meta.deletedAt'] = { $exists: false }
      }

      return CarModel.findOne(query);
    },

    findOneBySlug: (slug, includeDeleted = false) => {
      const query = {
        slug
      }

      if (includeDeleted === false) {
        query['meta.deletedAt'] = { $exists: false }
      }
      return CarModel.findOne(query);
    },

    findAllByCarMake: (carMakeId, sort = {}) => {
      console.log('findAllByCarMake', carMakeId, sort);

      return CarModel.find({ carMakeId, 'meta.deletedAt': { $exists: false } }, null, {
        sort
      });
    },

    findAll: (sort = {}) => {
      return CarModel.find({ 'meta.deletedAt': { $exists: false } }, null, {
        sort
      });
    },

    create: (record) => {
      return CarModel.create(record)
    },

    updateById: ({_id, updates}) => {
      if (!ObjectId.isValid(_id)) {
        throw(`Invalid ObjectId ${_id}.`);
      }

      return CarModel.updateOne({ _id, 'meta.deletedAt': { $exists: false } }, updates);
    },

    markAsDeletedById: async (_id) => {
      if (!ObjectId.isValid(_id)) {
        throw(`Invalid ObjectId ${_id}.`);
      }

      await CarModel.updateMany({ carModelId: _id, 'meta.deletedAt': { $exists: false } }, { 'meta.deletedAt': Date.now() });

      return CarModel.updateOne({ _id, 'meta.deletedAt': { $exists: false } }, { 'meta.deletedAt': Date.now() })
    },

    translateRecord: (record, locale) => {
      if (_.isEmpty(record))
        return record;
      console.log(">>> record", record);
      return Object.assign({}, record, {
        _localised: {
          locale: locale,
          name: translate(record.name, locale),
          niceName: translate(record.niceName, locale),
          alias: translate(record.alias, locale),
          description: translate(record.description, locale),
          url: translate(record.url, locale),
          colors: record.colors === undefined ? undefined : record.colors.map((color) => {
            return Object.assign({}, color, {
              name: translate(color.name, locale)
            })
          }),

          seo: {
            title: _.isEmpty(record.seo.title) ? "" : translate(record.seo.title, locale),
            description: _.isEmpty(record.seo.description) ? "" : translate(record.seo.description, locale),
            keywords: _.isEmpty(record.seo.keywords) ? "" : translate(record.seo.keywords, locale),
            image: _.isEmpty(record.seo.image) ? "" : translate(record.seo.image, locale)
          },

          // carMake: record.carMake === undefined ? undefined : db.carMake.translateRecord(record.carMake, locale)._localised

        }
      });
    }

  },

  carTrim: {
    findOneById: (_id, includeDeleted = false) => {
      if (!ObjectId.isValid(_id)) {
        throw(`Invalid ObjectId ${_id}.`);
      }

      const query = {
        _id
      };

      if (includeDeleted === false) {
        query['meta.deletedAt'] = { $exists: false }
      }

      return CarTrim.findOne(query);
    },

    findOneBySlug: (slug, includeDeleted = false) => {
      const query = {
        slug
      }

      if (includeDeleted === false) {
        query['meta.deletedAt'] = { $exists: false }
      }
      return CarTrim.findOne(query);
    },

    findAllByCarModel: (carModelId, sort = {}) => {
      console.log('findAllByCarModel', carModelId, sort);

      return CarTrim.find({ carModelId, 'meta.deletedAt': { $exists: false } }, null, {
        sort
      });
    },

    findAll: (sort = {}) => {
      return CarTrim.find({ 'meta.deletedAt': { $exists: false } }, null, {
        sort
      });
    },

    create: (record) => {
      return CarTrim.create(record)
    },

    updateById: ({_id, updates}) => {
      if (!ObjectId.isValid(_id)) {
        throw(`Invalid ObjectId ${_id}.`);
      }

      return CarTrim.updateOne({ _id, 'meta.deletedAt': { $exists: false } }, updates);
    },

    markAsDeletedById: async (_id) => {
      if (!ObjectId.isValid(_id)) {
        throw(`Invalid ObjectId ${_id}.`);
      }

      return CarTrim.updateOne({ _id, 'meta.deletedAt': { $exists: false } }, { 'meta.deletedAt': Date.now() })
    },

    translateRecord: (record, locale) => {
      if (_.isEmpty(record))
        return record;
      console.log(">>> record", record);
      return Object.assign({}, record, {
        _localised: {
          locale: locale,
          name: translate(record.name, locale),
          trim: translate(record.trim, locale),
          niceName: translate(record.niceName, locale),
          alias: translate(record.alias, locale),
          description: translate(record.description, locale),
          url: translate(record.url, locale),
          colors: record.colors === undefined ? undefined : record.colors.map((color) => {
            return Object.assign({}, color, {
              name: translate(color.name, locale)
            })
          }),
          

          seo: {
            title: _.isEmpty(record.seo.title) ? "" : translate(record.seo.title, locale),
            description: _.isEmpty(record.seo.description) ? "" : translate(record.seo.description, locale),
            keywords: _.isEmpty(record.seo.keywords) ? "" : translate(record.seo.keywords, locale),
            image: _.isEmpty(record.seo.image) ? "" : translate(record.seo.image, locale)
          },

          // carMake: record.carMake === undefined ? undefined : db.carMake.translateRecord(record.carMake, locale)._localised

        }
      });
    }

  }
  
  
  
  
  
  
}

module.exports = db;