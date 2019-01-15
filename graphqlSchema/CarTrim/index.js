const _ = require('lodash');
const db = require('../../helpers/db.js');
const updateTranslatable = require('../../helpers/updateTranslatable.js');




const typeDefs = `
  extend type Query {
    getCarTrimById(id: ID!, locale: String): CarTrim
    getCarTrimBySlug(slug: String!, locale: String): CarTrim
    getCarTrims(locale: String, orderBy: CarTrimOrderBy): [CarTrim]
    
  }

  extend type Mutation {

    addCarTrim(carModelId: ID!, slug: String!, locale: String!, localisedCarTrimInput: LocalisedCarTrimInput, carTrimImagesInput: CarTrimImagesInput, localisedCarColorInputs: [LocalisedCarColorInput], years: [Int!]!, bodyType: CarTrimBodyType!, doorCount: Int!, wheelCount: Int!, drivetrainType: CarTrimDrivetrainType!, transmissionType: CarTrimTransmissionType!, fuelType: CarTrimFuelType!): CarTrim
    
    updateCarTrim(id: ID!, slug: String!, locale: String!, localisedCarTrimInput: LocalisedCarTrimInput, carTrimImagesInput: CarTrimImagesInput, localisedCarColorInputs: [LocalisedCarColorInput], years: [Int!]!, bodyType: CarTrimBodyType!, doorCount: Int!, wheelCount: Int!, drivetrainType: CarTrimDrivetrainType!, transmissionType: CarTrimTransmissionType!, fuelType: CarTrimFuelType!): CarTrim

    deleteCarTrimById(id: ID!, locale: String): CarTrim
    
  }

  enum CarTrimBodyType {
    MOTORCYCLE
    HATCHBACK
    SEDAN
    MPV_MUV
    SUV
    CROSSOVER
    COUPE
    CONVERTIBLE
    WAGON
    VAN
    JEEP
    PICKUP_TRUCK
    UTE
  }

  enum CarTrimDrivetrainType {
    _2WD
    _AWD
    _FWD
    _RWD
    _4WD
    _6WD
    _8WD
  }

  enum CarTrimTransmissionType {
    MANUAL
    AUTOMATIC
    CVT
    DCT
    DSG
    TIPTRONIC
  }

  enum CarTrimFuelType {
    DIESEL
    PROPANE
    ETHANOL
    PETROL
    LPG
    ELECTRIC
    HYBRID
    HYDROGEN
  }

  enum CarTrimOrderBy {
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

  input LocalisedCarTrimInput {
    name: String
    niceName: String
    alias: [String]
    description: String
    url: String

    seoTitle: String
    seoDescription: String
    seoKeywords: String
    seoImage: String

    trim: String
  }

  input CarTrimImagesInput {
    thumbnail: String
    bwThumbnail: String
    banner: String
    front: String
    back: String
    left: String
    right: String
    top: String
    innerFrontLeft: String
    innerFrontRight: String
    innerBackLeft: String
    innerBackRight: String
  }

  type CarTrimImages {
    thumbnail: String
    bwThumbnail: String
    banner: String
    front: String
    back: String
    left: String
    right: String
    top: String
    innerFrontLeft: String
    innerFrontRight: String
    innerBackLeft: String
    innerBackRight: String
  }

  type LocalisedCarTrim {
    locale: String!

    name: String
    niceName: String
    alias: [String]
    description: String
    url: String

    colors: [LocalisedCarColor]

    trim: String

    seo: LocalisedSEOFields

    
  }

  
  type CarTrim {
    id: ID!
    slug: String!

    name: [Translatable]!
    niceName: [Translatable]!
    alias: [Translatable]!
    description: [Translatable]!
    url: [Translatable]!

    images: CarTrimImages

    colors: [CarColor]
    
    seo: SEOFields

    bodyType: CarTrimBodyType!
    years: [Int!]!
    trim: [Translatable]!
    doorCount: Int!
    wheelCount: Int!
    drivetrainType: CarTrimDrivetrainType!
    transmissionType: CarTrimTransmissionType!
    fuelType: CarTrimFuelType!
    
    
    _localised: LocalisedCarTrim
    meta: DataMeta

    carModel: CarModel!
  }

  

`;


const resolvers = {
  Query: {
    getCarTrims: async (root, args, context, info) => {

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

      const records = await db.carTrim.findAll(sort);

      if (args.locale !== undefined) {


        let translatedRecords = records.map((record) => {
          return db.carTrim.translateRecord(record.toObject(), args.locale)
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

    
    

    getCarTrimBySlug: async (root, args, context, info) => {

      const record = await db.carTrim.findOneBySlug(args.slug);

      if (record === null)
        return null;
      
      if (args.locale !== undefined) {
        return db.carTrim.translateRecord(record.toObject(), args.locale);
      } else {
        return record;
      }
    },

    getCarTrimById: async (root, args, context, info) => {

      const record = await db.carTrim.findOneById(args.id);

      if (record === null)
        return null;
      
      if (args.locale !== undefined) {
        return db.carTrim.translateRecord(record.toObject(), args.locale);
      } else {
        return record;
      }
    }

    
  },


  CarTrim: {
    id: ({
      _id
    }) => typeof _id === 'string' ? _id : _id.toString(),
    // title: (carTrim, args, context, info) => {
    //   console.log('args', args);
    //   console.log('context', context);
    //   console.log('info', info);
    //   console.log('carTrim', carTrim);
      
    //   return carTrim.title;

    // }

    carModel: async ({carModelId}, args, context, info) => {
      
      const record = await db.carModel.findOneById(carModelId);

      if (record === null)
        return null;

      if (info.variableValues.locale !== undefined) {
        return db.carModel.translateRecord(record.toObject(), info.variableValues.locale);
      } else {
        return record;
      }

    }
  },

  Mutation: {
    addCarTrim: async (root, args, context, info) => {
      console.log('addCarTrim', args);
      let current = Date.now();

      const carModel = await db.carModel.findOneById(args.carModelId);

      

      if (_.isEmpty(carModel)) {
        throw(`CarModel with id ${args.carModelId} does not exist.`);
      }


      const existingRecord = await db.carTrim.findOneBySlug(args.slug);

      if (!_.isEmpty(existingRecord)) {
        throw(`CarTrim with slug ${args.slug} already exists.`);
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
        carModelId: args.carModelId,
        carMakeId: carModel.carMakeId,
        slug: args.slug,
        name: [
          {
            locale: args.locale,
            translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.name
          }
        ],
        niceName: [
          {
            locale: args.locale,
            translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.niceName
          }
        ],

        alias: [
          {
            locale: args.locale,
            translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.alias
          }
        ],
        
        description: [
          {
            locale: args.locale,
            translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.description
          }
        ],
        url: [
          {
            locale: args.locale,
            translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.url
          }
        ],

        images : {
          thumbnail: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.thumbnail,
          bwThumbnail: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.bwThumbnail,
          banner: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.banner,

          front: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.front,
          back: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.back,
          left: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.left,
          right: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.right,
          top: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.top,
          innerFrontLeft: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.innerFrontLeft,
          innerFrontRight: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.innerFrontRight,
          innerBackLeft: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.innerBackLeft,
          innerBackRight: args.carTrimImagesInput === undefined ? "" : args.carTrimImagesInput.innerBackRight,
        },

        colors,

        
        trim: [
          {
            locale: args.locale,
            translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.trim
          }
        ],

        years: args.years,
        bodyType: args.bodyType,
        doorCount: args.doorCount,
        wheelCount: args.wheelCount,
        drivetrainType: args.drivetrainType,
        transmissionType: args.transmissionType,
        fuelType: args.fuelType,


        seo: {
          title: [
            {
              locale: args.locale,
              translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.seoTitle
            }
          ],
          description: [
            {
              locale: args.locale,
              translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.seoDescription
            }
          ],
          keywords: [
            {
              locale: args.locale,
              translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.seoKeywords
            }
          ],
          image: {
            locale: args.locale,
            translation: args.localisedCarTrimInput === undefined ? "" : args.localisedCarTrimInput.seoImage
          }
        },
        meta: {
          createdAt: current,
          updatedAt: current
        }
      };
      
      const record = await db.carTrim.create(data);
      
      return db.carTrim.translateRecord(
        record.toObject(), 
        args.locale
      );
      
      

    },



    updateCarTrim: async (root, args, context, info) => {
      console.log('updateCarTrim', args);
      let current = Date.now();

      const selectedRecord = await db.carTrim.findOneById(args.id);
      if (_.isEmpty(selectedRecord)) {
        throw(`CarTrim with id ${args.id} does not exists.`);
      }



      const existingRecord = await db.carTrim.findOneBySlug(args.slug);
      if (!_.isEmpty(existingRecord) && existingRecord._id.toString() !== args.id) {
        throw (`Slug ${args.slug} is already in use by another record with _id ${existingRecord._id}.`);
      }

        
      const updates = {
        'meta.updatedAt': current,
        slug: args.slug,
        years: args.years,
        bodyType: args.bodyType,
        doorCount: args.doorCount,
        wheelCount: args.wheelCount,
        drivetrainType: args.drivetrainType,
        transmissionType: args.transmissionType,
        fuelType: args.fuelType,


        colors: []
      };

      if (args.localisedCarTrimInput !== undefined) {


        if (args.localisedCarTrimInput.name !== undefined) {
          Object.assign(updates, {
            name: updateTranslatable({
              data: selectedRecord.name, update: args.localisedCarTrimInput.name, locale: args.locale
            })
          })
        }

        if (args.localisedCarTrimInput.niceName !== undefined) {
          Object.assign(updates, {
            niceName: updateTranslatable({
              data: selectedRecord.niceName, update: args.localisedCarTrimInput.niceName, locale: args.locale
            })
          })
        }

        if (args.localisedCarTrimInput.alias !== undefined) {
          Object.assign(updates, {
            alias: updateTranslatable({
              data: selectedRecord.alias, update: args.localisedCarTrimInput.alias, locale: args.locale
            })
          })
        }

        if (args.localisedCarTrimInput.description !== undefined) {
          Object.assign(updates, {
            description: updateTranslatable({
              data: selectedRecord.description, update: args.localisedCarTrimInput.description, locale: args.locale
            })
          })
        }

        if (args.localisedCarTrimInput.url !== undefined) {
          Object.assign(updates, {
            url: updateTranslatable({
              data: selectedRecord.url, update: args.localisedCarTrimInput.url, locale: args.locale
            })
          })
        }


        if (args.localisedCarTrimInput.seoTitle !== undefined) {
          Object.assign(updates, {
            'seo.title': updateTranslatable({
              data: selectedRecord.seo.title, update: args.localisedCarTrimInput.seoTitle, locale: args.locale
            })
          })
        }

        if (args.localisedCarTrimInput.seoKeywords !== undefined) {
          Object.assign(updates, {
            'seo.keywords': updateTranslatable({
              data: selectedRecord.seo.keywords, update: args.localisedCarTrimInput.seoKeywords, locale: args.locale
            })
          })
        }

        if (args.localisedCarTrimInput.seoDescription !== undefined) {
          Object.assign(updates, {
            'seo.description': updateTranslatable({
              data: selectedRecord.seo.description, update: args.localisedCarTrimInput.seoDescription, locale: args.locale
            })
          })
        }

        if (args.localisedCarTrimInput.seoImage !== undefined) {
          Object.assign(updates, {
            'seo.image': updateTranslatable({
              data: selectedRecord.seo.image, update: args.localisedCarTrimInput.seoImage, locale: args.locale
            })
          })
        }

        if (args.localisedCarTrimInput.trim !== undefined) {
          Object.assign(updates, {
            trim: updateTranslatable({
              data: selectedRecord.trim, update: args.localisedCarTrimInput.trim, locale: args.locale
            })
          })
        }

      }



      if (args.carTrimImagesInput !== undefined) {

        if (args.carTrimImagesInput.thumbnail !== undefined) {
          Object.assign(updates, {
            'images.thumbnail': args.carTrimImagesInput.thumbnail
          })
        }

        if (args.carTrimImagesInput.bwThumbnail !== undefined) {
          Object.assign(updates, {
            'images.bwThumbnail': args.carTrimImagesInput.bwThumbnail
          })
        }

        
        if (args.carTrimImagesInput.banner !== undefined) {
          Object.assign(updates, {
            'images.banner': args.carTrimImagesInput.banner
          })
        }




        if (args.carTrimImagesInput.front !== undefined) {
          Object.assign(updates, {
            'images.front': args.carTrimImagesInput.front
          })
        }

        if (args.carTrimImagesInput.back !== undefined) {
          Object.assign(updates, {
            'images.back': args.carTrimImagesInput.back
          })
        }

        if (args.carTrimImagesInput.left !== undefined) {
          Object.assign(updates, {
            'images.left': args.carTrimImagesInput.left
          })
        }

        if (args.carTrimImagesInput.right !== undefined) {
          Object.assign(updates, {
            'images.right': args.carTrimImagesInput.right
          })
        }

        if (args.carTrimImagesInput.top !== undefined) {
          Object.assign(updates, {
            'images.top': args.carTrimImagesInput.top
          })
        }

        if (args.carTrimImagesInput.innerFrontLeft !== undefined) {
          Object.assign(updates, {
            'images.innerFrontLeft': args.carTrimImagesInput.innerFrontLeft
          })
        }

        if (args.carTrimImagesInput.banner !== undefined) {
          Object.assign(updates, {
            'images.innerFrontRight': args.carTrimImagesInput.innerFrontRight
          })
        }

        if (args.carTrimImagesInput.innerBackLeft !== undefined) {
          Object.assign(updates, {
            'images.innerBackLeft': args.carTrimImagesInput.innerBackLeft
          })
        }

        if (args.carTrimImagesInput.innerBackRight !== undefined) {
          Object.assign(updates, {
            'images.innerBackRight': args.carTrimImagesInput.innerBackRight
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

      await db.carTrim.updateById({_id: args.id, updates});

      const updatedRecord = await db.carTrim.findOneById(args.id);
      
      return db.carTrim.translateRecord(updatedRecord.toObject(), args.locale);

    },




    deleteCarTrimById: async (root, args, context, info) => {
      console.log('deleteCarTrimById', args);
      

      await db.carTrim.markAsDeletedById(args.id);

      
      const updatedRecord = await db.carTrim.findOneById(args.id, true);
      
      if (args.locale !== undefined) {
        return db.carTrim.translateRecord(updatedRecord.toObject(), args.locale);
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