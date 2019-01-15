const _ = require('lodash');
const db = require('../../helpers/db.js');
const updateTranslatable = require('../../helpers/updateTranslatable.js');




const typeDefs = `
  extend type Query {
    getCarModelById(id: ID!, locale: String, orderCarTrimsBy: CarTrimOrderBy): CarModel
    getCarModelBySlug(slug: String!, locale: String, orderCarTrimsBy: CarTrimOrderBy): CarModel
    getCarModels(locale: String, orderBy: CarModelOrderBy, orderCarTrimsBy: CarTrimOrderBy): [CarModel]
    
  }

  extend type Mutation {

    addCarModel(carMakeId: ID!, slug: String!, locale: String!, localisedCarModelInput: LocalisedCarModelInput, carModelImagesInput: CarModelImagesInput, localisedCarColorInputs: [LocalisedCarColorInput]): CarModel
    
    updateCarModel(id: ID!, slug: String!, locale: String!, localisedCarModelInput: LocalisedCarModelInput, carModelImagesInput: CarModelImagesInput, localisedCarColorInputs: [LocalisedCarColorInput]): CarModel

    deleteCarModelById(id: ID!, locale: String): CarModel
    
  }



  enum CarModelOrderBy {
    slug_ASC
    slug_DESC
    name_ASC
    name_DESC
    niceName_ASC
    niceName_DESC
    createdAt_ASC
    createdAt_DESC
    updatedAt_ASC
    updatedAt_DESC
  }

  input LocalisedCarModelInput {
    name: String
    niceName: String
    alias: [String]
    description: String
    url: String

    seoTitle: String
    seoDescription: String
    seoKeywords: String
    seoImage: String
  }

  input CarModelImagesInput {
    thumbnail: String
    bwThumbnail: String
    banner: String
  }

  type CarModelImages {
    thumbnail: String
    bwThumbnail: String
    banner: String
  }

  type LocalisedCarModel {
    locale: String!

    name: String
    niceName: String
    alias: [String]
    description: String
    url: String

    colors: [LocalisedCarColor]

    seo: LocalisedSEOFields

    
  }

  
  type CarModel {
    id: ID!
    slug: String!

    name: [Translatable]!
    niceName: [Translatable]!
    alias: [Translatable]!
    description: [Translatable]!
    url: [Translatable]!

    images: CarModelImages

    colors: [CarColor]
    
    seo: SEOFields
    
    
    _localised: LocalisedCarModel
    meta: DataMeta

    carMake: CarMake!
    carTrims: [CarTrim]!
  }

  

`;


const resolvers = {
  Query: {
    getCarModels: async (root, args, context, info) => {

      const orderBy = _.isEmpty(args.orderBy) ? 'updatedAt_DESC' : args.orderBy;
      // console.log(">>>>>>", args, orderBy);
      let sort = {};


      // slug_ASC
      // slug_DESC
      // name_ASC
      // name_DESC
      // niceName_ASC
      // niceName_DESC
      // createdAt_ASC
      // createdAt_DESC
      // updatedAt_ASC
      // updatedAt_DESC


      switch (orderBy) {
        case 'slug_ASC':
          sort = {
            slug: 1
          };
          break;
        case 'slug_DESC':
          sort = {
            slug: -1
          };
          break;
        case 'createdAt_ASC':
          sort = {
            'meta.createdAt': 1
          };
          break;
        case 'createdAt_DESC':
          sort = {
            'meta.createdAt': -1
          };
          break;
        case 'updatedAt_ASC':
          sort = {
            'meta.updatedAt': 1
          };
          break;
        case 'updatedAt_DESC':
          sort = {
            'meta.updatedAt': -1
          };
          break;
      }

      const records = await db.carModel.findAll(sort);

      if (args.locale !== undefined) {


        let translatedRecords = records.map((record) => {
          return db.carModel.translateRecord(record.toObject(), args.locale)
        })

        if (orderBy === 'niceName_ASC' || orderBy === 'niceName_DESC') {
          translatedRecords = _.orderBy(translatedRecords, ['_localised.niceName'], [orderBy === 'niceName_ASC' ? 'asc' : 'desc']);
        } else if (orderBy === 'name_ASC' || orderBy === 'name_DESC') {
          translatedRecords = _.orderBy(translatedRecords, ['_localised.name'], [orderBy === 'name_ASC' ? 'asc' : 'desc']);
        }

        return translatedRecords;
      } else {
        return records;
      }
    },

    
    

    getCarModelBySlug: async (root, args, context, info) => {

      const record = await db.carModel.findOneBySlug(args.slug);

      if (record === null)
        return null;
      
      if (args.locale !== undefined) {
        return db.carModel.translateRecord(record.toObject(), args.locale);
      } else {
        return record;
      }
    },

    getCarModelById: async (root, args, context, info) => {

      const record = await db.carModel.findOneById(args.id);

      if (record === null)
        return null;
      
      if (args.locale !== undefined) {
        return db.carModel.translateRecord(record.toObject(), args.locale);
      } else {
        return record;
      }
    }

    
  },


  CarModel: {
    id: ({
      _id
    }) => typeof _id === 'string' ? _id : _id.toString(),
    // title: (carModel, args, context, info) => {
    //   console.log('args', args);
    //   console.log('context', context);
    //   console.log('info', info);
    //   console.log('carModel', carModel);
      
    //   return carModel.title;

    // }

    carMake: async ({carMakeId}, args, context, info) => {


      const record = await db.carMake.findOneById(carMakeId);

      if (record === null)
        return null;

      if (info.variableValues.locale !== undefined) {
        return db.carMake.translateRecord(record.toObject(), info.variableValues.locale);
      } else {
        return record;
      }

    },

    carTrims: async ({_id}, args, context, info) => {

      // console.log('CarModel.carTrims', parent, info);

      const orderBy = _.isEmpty(info.variableValues.orderCarTrimsBy) ? 'slug_ASC' : info.variableValues.orderCarTrimsBy;
      let sort = {};

      switch (orderBy) {
        case 'slug_ASC':
          sort = {
            slug: 1
          };
          break;
        case 'slug_DESC':
          sort = {
            slug: -1
          };
          break;
        case 'createdAt_ASC':
          sort = {
            'meta.createdAt': 1
          };
          break;
        case 'createdAt_DESC':
          sort = {
            'meta.createdAt': -1
          };
          break;
        case 'updatedAt_ASC':
          sort = {
            'meta.updatedAt': 1
          };
          break;
        case 'updatedAt_DESC':
          sort = {
            'meta.updatedAt': -1
          };
          break;
      }


      const records = await db.carTrim.findAllByCarModel(_id, sort);

      

      if (info.variableValues.locale !== undefined) {


        let translatedRecords = records.map((record) => {
          return db.carTrim.translateRecord(record.toObject(), info.variableValues.locale)
        })

        if (orderBy === 'niceName_ASC' || orderBy === 'niceName_DESC') {
          translatedRecords = _.orderBy(translatedRecords, ['_localised.niceName'], [orderBy === 'niceName_ASC' ? 'asc' : 'desc']);
        } else if (orderBy === 'name_ASC' || orderBy === 'name_DESC') {
          translatedRecords = _.orderBy(translatedRecords, ['_localised.name'], [orderBy === 'name_ASC' ? 'asc' : 'desc']);
        }

        return translatedRecords;
      } else {
        return records;
      }
    }

  },

  Mutation: {
    addCarModel: async (root, args, context, info) => {
      console.log('addCarModel', args);
      let current = Date.now();

      const carMake = await db.carMake.findOneById(args.carMakeId);

      

      if (_.isEmpty(carMake)) {
        throw(`CarMake with id ${args.carMakeId} does not exist.`);
      }


      const existingRecord = await db.carModel.findOneBySlug(args.slug);

      if (!_.isEmpty(existingRecord)) {
        throw(`CarModel with slug ${args.slug} already exists.`);
      }

      let colors = [];

      if (!_.isEmpty(args.localisedCarColorInputs)) {
        args.localisedCarColorInputs.map((localisedCarColorInput) => {
          colors.push({
            key: localisedCarColorInput.key,
            baseColor: localisedCarColorInput.baseColor,
            hex: localisedCarColorInput.hex === undefined ? "" : localisedCarColorInput.hex,
            image: localisedCarColorInput.image === undefined ? "" : localisedCarColorInput.image,

            name: [
              {
                locale: args.locale,
                translation: localisedCarColorInput.name
              }
            ]
          })
        });
      }


      const data = {
        carMakeId: args.carMakeId,
        slug: args.slug,
        name: [
          {
            locale: args.locale,
            translation: args.localisedCarModelInput === undefined ? "" : args.localisedCarModelInput.name
          }
        ],
        niceName: [
          {
            locale: args.locale,
            translation: args.localisedCarModelInput === undefined ? "" : args.localisedCarModelInput.niceName
          }
        ],

        alias: [
          {
            locale: args.locale,
            translation: args.localisedCarModelInput === undefined ? "" : args.localisedCarModelInput.alias
          }
        ],
        
        description: [
          {
            locale: args.locale,
            translation: args.localisedCarModelInput === undefined ? "" : args.localisedCarModelInput.description
          }
        ],
        url: [
          {
            locale: args.locale,
            translation: args.localisedCarModelInput === undefined ? "" : args.localisedCarModelInput.url
          }
        ],

        images : {
          thumbnail: args.carModelImagesInput === undefined ? "" : args.carModelImagesInput.thumbnail,
          bwThumbnail: args.carModelImagesInput === undefined ? "" : args.carModelImagesInput.bwThumbnail,
          banner: args.carModelImagesInput === undefined ? "" : args.carModelImagesInput.banner
        },

        colors,

        seo: {
          title: [
            {
              locale: args.locale,
              translation: args.localisedCarModelInput === undefined ? "" : args.localisedCarModelInput.seoTitle
            }
          ],
          description: [
            {
              locale: args.locale,
              translation: args.localisedCarModelInput === undefined ? "" : args.localisedCarModelInput.seoDescription
            }
          ],
          keywords: [
            {
              locale: args.locale,
              translation: args.localisedCarModelInput === undefined ? "" : args.localisedCarModelInput.seoKeywords
            }
          ],
          image: {
            locale: args.locale,
            translation: args.localisedCarModelInput === undefined ? "" : args.localisedCarModelInput.seoImage
          }
        },
        meta: {
          createdAt: current,
          updatedAt: current
        }
      };
      
      const record = await db.carModel.create(data);
      
      return db.carModel.translateRecord(
        record.toObject(), 
        args.locale
      );
      
      

    },



    updateCarModel: async (root, args, context, info) => {
      console.log('updateCarModel', args);
      let current = Date.now();

      const selectedRecord = await db.carModel.findOneById(args.id);
      if (_.isEmpty(selectedRecord)) {
        throw(`CarModel with id ${args.id} does not exists.`);
      }



      const existingRecord = await db.carModel.findOneBySlug(args.slug);
      if (!_.isEmpty(existingRecord) && existingRecord._id.toString() !== args.id) {
        throw (`Slug ${args.slug} is already in use by another record with _id ${existingRecord._id}.`);
      }

        
      const updates = {
        'meta.updatedAt': current,
        slug: args.slug,
        colors: []
      };

      if (args.localisedCarModelInput !== undefined) {


        if (args.localisedCarModelInput.name !== undefined) {
          Object.assign(updates, {
            name: updateTranslatable({
              data: selectedRecord.name, update: args.localisedCarModelInput.name, locale: args.locale
            })
          })
        }

        if (args.localisedCarModelInput.niceName !== undefined) {
          Object.assign(updates, {
            niceName: updateTranslatable({
              data: selectedRecord.niceName, update: args.localisedCarModelInput.niceName, locale: args.locale
            })
          })
        }

        if (args.localisedCarModelInput.alias !== undefined) {
          Object.assign(updates, {
            alias: updateTranslatable({
              data: selectedRecord.alias, update: args.localisedCarModelInput.alias, locale: args.locale
            })
          })
        }

        if (args.localisedCarModelInput.description !== undefined) {
          Object.assign(updates, {
            description: updateTranslatable({
              data: selectedRecord.description, update: args.localisedCarModelInput.description, locale: args.locale
            })
          })
        }

        if (args.localisedCarModelInput.url !== undefined) {
          Object.assign(updates, {
            url: updateTranslatable({
              data: selectedRecord.url, update: args.localisedCarModelInput.url, locale: args.locale
            })
          })
        }


        if (args.localisedCarModelInput.seoTitle !== undefined) {
          Object.assign(updates, {
            'seo.title': updateTranslatable({
              data: selectedRecord.seo.title, update: args.localisedCarModelInput.seoTitle, locale: args.locale
            })
          })
        }

        if (args.localisedCarModelInput.seoKeywords !== undefined) {
          Object.assign(updates, {
            'seo.keywords': updateTranslatable({
              data: selectedRecord.seo.keywords, update: args.localisedCarModelInput.seoKeywords, locale: args.locale
            })
          })
        }

        if (args.localisedCarModelInput.seoDescription !== undefined) {
          Object.assign(updates, {
            'seo.description': updateTranslatable({
              data: selectedRecord.seo.description, update: args.localisedCarModelInput.seoDescription, locale: args.locale
            })
          })
        }

        if (args.localisedCarModelInput.seoImage !== undefined) {
          Object.assign(updates, {
            'seo.image': updateTranslatable({
              data: selectedRecord.seo.image, update: args.localisedCarModelInput.seoImage, locale: args.locale
            })
          })
        }

      }



      if (args.carModelImagesInput !== undefined) {

        if (args.carModelImagesInput.thumbnail !== undefined) {
          Object.assign(updates, {
            'images.thumbnail': args.carModelImagesInput.thumbnail
          })
        }

        if (args.carModelImagesInput.bwThumbnail !== undefined) {
          Object.assign(updates, {
            'images.bwThumbnail': args.carModelImagesInput.bwThumbnail
          })
        }

        
        if (args.carModelImagesInput.banner !== undefined) {
          Object.assign(updates, {
            'images.banner': args.carModelImagesInput.banner
          })
        }

      }

      
      
      // merge in colors from input

        if (!_.isEmpty(args.localisedCarColorInputs)) {
          args.localisedCarColorInputs.map((localisedCarColorInput) => {
            const updateIdex = _.findIndex(selectedRecord.colors, {
              key: localisedCarColorInput.key
            });

            updates.colors.push({
              key: localisedCarColorInput.key,
              baseColor: localisedCarColorInput.baseColor,
              hex: localisedCarColorInput.hex === undefined ? "" : localisedCarColorInput.hex,
              image: localisedCarColorInput.image === undefined ? "" : localisedCarColorInput.image,

              name: updateIdex !== -1 ?
                // color key exist, clone name (translatable)
                updateTranslatable({
                  data: selectedRecord.colors[updateIdex].name, update: localisedCarColorInput.name, locale: args.locale
                })
              : // color key not exist
                [
                  {
                    locale: args.locale,
                    translation: localisedCarColorInput.name
                  }
                ]
            });

          });
        }

      await db.carModel.updateById({_id: args.id, updates});

      const updatedRecord = await db.carModel.findOneById(args.id);
      
      return db.carModel.translateRecord(updatedRecord.toObject(), args.locale);

    },




    deleteCarModelById: async (root, args, context, info) => {
      console.log('deleteCarModelById', args);
      

      await db.carModel.markAsDeletedById(args.id);

      
      const updatedRecord = await db.carModel.findOneById(args.id, true);
      
      if (args.locale !== undefined) {
        return db.carModel.translateRecord(updatedRecord.toObject(), args.locale);
      } else {
        return updatedRecord;
      }
      

    }

  }
};

module.exports = {
  typeDefs,
  resolvers
};