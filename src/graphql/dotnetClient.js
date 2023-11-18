import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

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

const dotnetClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default dotnetClient;
