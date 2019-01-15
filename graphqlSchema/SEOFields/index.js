const typeDefs = `

  type SEOFields {
    title: [Translatable]
    description: [Translatable]
    keywords: [Translatable]
    image: [Translatable]
  }

  type LocalisedSEOFields {
    title: String
    description: String
    keywords: String
    image: String
  }
  

`;

const resolvers = {

};

module.exports = {
  typeDefs,
  resolvers
};


module.exports = {typeDefs, resolvers};