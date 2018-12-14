const typeDefs = `




  type Field {
    key: String!
    value: [Translatable]
  }
  
  type LocalisedField {
    key: String!
    value: DataField
  }

  input LocalisedFieldInput {
    key: String!
    value: DataField
  }


  type UnlocalisedField {
    key: String!
    value: DataField
  }

  input UnlocalisedFieldInput {
    key: String!
    value: DataField
  }



`;




module.exports = {
  typeDefs,
  
};