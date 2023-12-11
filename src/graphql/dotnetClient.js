import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
const cache = new InMemoryCache({
  typePolicies: {
    Subscription: {
      fields: {
        messageAction: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    Query: {
      fields: {
        getReceiverMessages: {
          merge: false,
        },
      },
    },
  },
});
const httpLink = createHttpLink({
  //kubernetes pod port
  uri: 'http://localhost:5000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const jwt = localStorage.getItem('jwt');
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${jwt} `,
    },
  };
});
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:5000/graphql',
  })
);
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);
const dotnetClient = new ApolloClient({
  link: splitLink,
  cache,
});

export default dotnetClient;
