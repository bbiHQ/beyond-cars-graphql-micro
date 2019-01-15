const _ = require('lodash');
const db = require('../../helpers/db.js');
const updateTranslatable = require('../../helpers/updateTranslatable.js');





const typeDefs = `
  extend type Query {
    getCarMakeById(id: ID!, locale: String, orderCarModelsBy: CarModelOrderBy, orderCarTrimsBy: CarTrimOrderBy): CarMake
    getCarMakeBySlug(slug: String!, locale: String, orderCarModelsBy: CarModelOrderBy, orderCarTrimsBy: CarTrimOrderBy): CarMake
    getCarMakes(locale: String, orderBy: CarMakeOrderBy, orderCarModelsBy: CarModelOrderBy, orderCarTrimsBy: CarTrimOrderBy): [CarMake]
    
  }

  extend type Mutation {

    addCarMake(slug: String!, locale: String!, localisedCarMakeInput: LocalisedCarMakeInput, carMakeImagesInput: CarMakeImagesInput, localisedCarColorInputs: [LocalisedCarColorInput]): CarMake
    
    updateCarMake(id: ID!, slug: String!, locale: String!, localisedCarMakeInput: LocalisedCarMakeInput, carMakeImagesInput: CarMakeImagesInput, localisedCarColorInputs: [LocalisedCarColorInput]): CarMake

    deleteCarMakeById(id: ID!, locale: String): CarMake
    
  }



  enum CarMakeOrderBy {
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

  input LocalisedCarMakeInput {
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

  input CarMakeImagesInput {
    thumbnail: String
    bwThumbnail: String
    banner: String
  }

  type CarMakeImages {
    thumbnail: String
    bwThumbnail: String
    banner: String
  }

  type LocalisedCarMake {
    locale: String!

    name: String
    niceName: String
    alias: [String]
    description: String
    url: String

    colors: [LocalisedCarColor]

    seo: LocalisedSEOFields
  }

  
  type CarMake {
    id: ID!
    slug: String!

    name: [Translatable]!
    niceName: [Translatable]!
    alias: [Translatable]!
    description: [Translatable]!
    url: [Translatable]!

    images: CarMakeImages

    colors: [CarColor]
    
    seo: SEOFields
    
    
    _localised: LocalisedCarMake
    meta: DataMeta

    carModels: [CarModel]!
  }

  

`;






const resolvers = {
  Query: {
    getCarMakes: async (root, args, context, info) => {
      console.log('getCarMakes', info);
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

      const records = await db.carMake.findAll(sort);

      
      if (args.locale !== undefined) {


        let translatedRecords = records.map((record) => {
          return db.carMake.translateRecord(record.toObject(), args.locale)
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

    
    

    getCarMakeBySlug: async (root, args, context, info) => {

      const record = await db.carMake.findOneBySlug(args.slug);

      if (record === null)
        return null;
      
      if (args.locale !== undefined) {
        return db.carMake.translateRecord(record.toObject(), args.locale);
      } else {
        return record;
      }
    },

    getCarMakeById: async (root, args, context, info) => {

      const record = await db.carMake.findOneById(args.id);

      if (record === null)
        return null;
      
      if (args.locale !== undefined) {
        return db.carMake.translateRecord(record.toObject(), args.locale);
      } else {
        return record;
      }
    }

    
  },


  CarMake: {
    id: ({
      _id
    }) => typeof _id === 'string' ? _id : _id.toString(),
    // title: (carMake, args, context, info) => {
    //   console.log('args', args);
    //   console.log('context', context);
    //   console.log('info', info);
    //   console.log('carMake', carMake);
      
    //   return carMake.title;

    // }

    carModels: async ({_id}, args, context, info) => {

      // console.log('CarMake.carModels', parent, info);

      const orderBy = _.isEmpty(info.variableValues.orderCarModelsBy) ? 'slug_ASC' : info.variableValues.orderCarModelsBy;
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


      const records = await db.carModel.findAllByCarMake(_id, sort);

      

      if (info.variableValues.locale !== undefined) {


        let translatedRecords = records.map((record) => {
          return db.carModel.translateRecord(record.toObject(), info.variableValues.locale)
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
    addCarMake: async (root, args, context, info) => {
      console.log('addCarMake', args);
      let current = Date.now();

      const existingRecord = await db.carMake.findOneBySlug(args.slug);

      if (!_.isEmpty(existingRecord)) {
        throw(`CarMake with slug ${args.slug} already exists.`);
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
        slug: args.slug,
        name: [
          {
            locale: args.locale,
            translation: args.localisedCarMakeInput === undefined ? "" : args.localisedCarMakeInput.name
          }
        ],
        niceName: [
          {
            locale: args.locale,
            translation: args.localisedCarMakeInput === undefined ? "" : args.localisedCarMakeInput.niceName
          }
        ],

        alias: [
          {
            locale: args.locale,
            translation: args.localisedCarMakeInput === undefined ? "" : args.localisedCarMakeInput.alias
          }
        ],
        
        description: [
          {
            locale: args.locale,
            translation: args.localisedCarMakeInput === undefined ? "" : args.localisedCarMakeInput.description
          }
        ],
        url: [
          {
            locale: args.locale,
            translation: args.localisedCarMakeInput === undefined ? "" : args.localisedCarMakeInput.url
          }
        ],

        images : {
          thumbnail: args.carMakeImagesInput === undefined ? "" : args.carMakeImagesInput.thumbnail,
          bwThumbnail: args.carMakeImagesInput === undefined ? "" : args.carMakeImagesInput.bwThumbnail,
          banner: args.carMakeImagesInput === undefined ? "" : args.carMakeImagesInput.banner
        },

        colors,

        seo: {
          title: [
            {
              locale: args.locale,
              translation: args.localisedCarMakeInput === undefined ? "" : args.localisedCarMakeInput.seoTitle
            }
          ],
          description: [
            {
              locale: args.locale,
              translation: args.localisedCarMakeInput === undefined ? "" : args.localisedCarMakeInput.seoDescription
            }
          ],
          keywords: [
            {
              locale: args.locale,
              translation: args.localisedCarMakeInput === undefined ? "" : args.localisedCarMakeInput.seoKeywords
            }
          ],
          image: {
            locale: args.locale,
            translation: args.localisedCarMakeInput === undefined ? "" : args.localisedCarMakeInput.seoImage
          }
        },
        meta: {
          createdAt: current,
          updatedAt: current
        }
      };
      
      const record = await db.carMake.create(data);

      return db.carMake.translateRecord(record.toObject(), args.locale);
      
      

    },



    updateCarMake: async (root, args, context, info) => {
      console.log('updateCarMake', args);
      let current = Date.now();

      const selectedRecord = await db.carMake.findOneById(args.id);
      if (_.isEmpty(selectedRecord)) {
        throw(`CarMake with id ${args.id} does not exists.`);
      }



      const existingRecord = await db.carMake.findOneBySlug(args.slug);
      if (!_.isEmpty(existingRecord) && existingRecord._id.toString() !== args.id) {
        throw (`Slug ${args.slug} is already in use by another record with _id ${existingRecord._id}.`);
      }

        
      const updates = {
        'meta.updatedAt': current,
        slug: args.slug,
        colors: []
      };

      if (args.localisedCarMakeInput !== undefined) {


        if (args.localisedCarMakeInput.name !== undefined) {
          Object.assign(updates, {
            name: updateTranslatable({
              data: selectedRecord.name, update: args.localisedCarMakeInput.name, locale: args.locale
            })
          })
        }

        if (args.localisedCarMakeInput.niceName !== undefined) {
          Object.assign(updates, {
            niceName: updateTranslatable({
              data: selectedRecord.niceName, update: args.localisedCarMakeInput.niceName, locale: args.locale
            })
          })
        }

        if (args.localisedCarMakeInput.alias !== undefined) {
          Object.assign(updates, {
            alias: updateTranslatable({
              data: selectedRecord.alias, update: args.localisedCarMakeInput.alias, locale: args.locale
            })
          })
        }

        if (args.localisedCarMakeInput.description !== undefined) {
          Object.assign(updates, {
            description: updateTranslatable({
              data: selectedRecord.description, update: args.localisedCarMakeInput.description, locale: args.locale
            })
          })
        }

        if (args.localisedCarMakeInput.url !== undefined) {
          Object.assign(updates, {
            url: updateTranslatable({
              data: selectedRecord.url, update: args.localisedCarMakeInput.url, locale: args.locale
            })
          })
        }


        if (args.localisedCarMakeInput.seoTitle !== undefined) {
          Object.assign(updates, {
            'seo.title': updateTranslatable({
              data: selectedRecord.seo.title, update: args.localisedCarMakeInput.seoTitle, locale: args.locale
            })
          })
        }

        if (args.localisedCarMakeInput.seoKeywords !== undefined) {
          Object.assign(updates, {
            'seo.keywords': updateTranslatable({
              data: selectedRecord.seo.keywords, update: args.localisedCarMakeInput.seoKeywords, locale: args.locale
            })
          })
        }

        if (args.localisedCarMakeInput.seoDescription !== undefined) {
          Object.assign(updates, {
            'seo.description': updateTranslatable({
              data: selectedRecord.seo.description, update: args.localisedCarMakeInput.seoDescription, locale: args.locale
            })
          })
        }

        if (args.localisedCarMakeInput.seoImage !== undefined) {
          Object.assign(updates, {
            'seo.image': updateTranslatable({
              data: selectedRecord.seo.image, update: args.localisedCarMakeInput.seoImage, locale: args.locale
            })
          })
        }

      }



      if (args.carMakeImagesInput !== undefined) {

        if (args.carMakeImagesInput.thumbnail !== undefined) {
          Object.assign(updates, {
            'images.thumbnail': args.carMakeImagesInput.thumbnail
          })
        }

        if (args.carMakeImagesInput.bwThumbnail !== undefined) {
          Object.assign(updates, {
            'images.bwThumbnail': args.carMakeImagesInput.bwThumbnail
          })
        }

        
        if (args.carMakeImagesInput.banner !== undefined) {
          Object.assign(updates, {
            'images.banner': args.carMakeImagesInput.banner
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

      await db.carMake.updateById({_id: args.id, updates});

      const updatedRecord = await db.carMake.findOneById(args.id);
      
      return db.carMake.translateRecord(updatedRecord.toObject(), args.locale);

    },




    deleteCarMakeById: async (root, args, context, info) => {
      console.log('deleteCarMakeById', args);
      

      await db.carMake.markAsDeletedById(args.id);

      
      const updatedRecord = await db.carMake.findOneById(args.id, true);

      


      
      if (args.locale !== undefined) {
        return db.carMake.translateRecord(updatedRecord.toObject(), args.locale);
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