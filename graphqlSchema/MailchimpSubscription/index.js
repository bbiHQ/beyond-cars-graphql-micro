// const translate = require('../../helpers/translate.js');
// const updateTranslatable = require('../../helpers/updateTranslatable.js');

// const { json, send } = require('micro');



const subscribe = async ({email, name, listId}) => {
  const Mailchimp = require('mailchimp-api-v3')

  const mailchimpAPI = new Mailchimp(process.env.MAILCHIMP_API_KEY);

  return await mailchimpAPI.post(
    `/lists/${listId}`, {
      members: [
        {
          email_address: email,
          merge_fields: {
            'NAME': name
          },
          status: 'subscribed',
        }
      ],
      update_existing: true
    })
    .catch((error) => {
      console.error('error', error);
      // send(res, error.status, Object.assign({}, error, { status: 'error' }));
    });

  // console.log('result', result);


}


const typeDefs = `
  extend type Mutation {
    addSubscriber(email: String!, name: String, listId: String!): MailchimpAPIResult
  }

  type MailchimpAPIResult {
    status: String!
    result: JSON
  }
`;


const resolvers = {
  Mutation: {
    addSubscriber: async (root, args, context, info) => {
      const _ = require('lodash-checkit');
      if (!_.isEmail(args.email)) {
        throw new Error('The email address is invalid.');
      }


      const result = await subscribe({email: args.email, listId: args.listId, name: args.name});

      if (result.errors.length > 0) {

        throw new Error(result.errors[0].error);
      }

      return {
        status: "SUCCESS",
        result: result,
      }
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
};