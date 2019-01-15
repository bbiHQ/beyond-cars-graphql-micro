


const typeDefs = `
  enum BaseColor {
    Red
    Orange
    Yellow
    Green
    Blue
    Purple
    Brown
    Magenta
    Tan
    Cyan
    Olive
    Maroon
    Navy
    Aquamarine
    Turquoise
    Silver
    Lime
    Teal
    Indigo
    Violet
    Pink
    Black
    White
    Gray
  }

  input LocalisedCarColorInput {
    baseColor: BaseColor!
    key: String!
    name: String
    hex: String
    image: String
  }

  type LocalisedCarColor {
    locale: String!

    baseColor: BaseColor!
    key: String!
    name: String
    hex: String
    image: String
  }

  
  type CarColor {
    baseColor: BaseColor!
    key: String!
    name: [Translatable]!
    hex: String
    image: String
  }

  

`;



module.exports = {
  typeDefs
};