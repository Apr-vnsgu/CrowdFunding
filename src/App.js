import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux';
import RootLayout from './RootLayout';
import Projects from './components/Projects';
import client from './graphql/client';
import store from './store/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateProject from './components/CreateProject';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Bookmarks from './components/Bookmarks';
import Discover from './components/Discover';
import YourProjects from './components/YourProjects';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route index element={<Projects />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/bookmarks' element={<Bookmarks />} />
        <Route path='/create' element={<CreateProject />} />
        <Route path='/discover' element={<Discover />} />
        <Route path='/yourprojects' element={<YourProjects />} />
      </Route>
    )
  );
  return (
    <div className='App'>
      <Provider store={store}>
        <ApolloProvider client={client}>
          <RouterProvider router={router} />
        </ApolloProvider>
      </Provider>
    </div>
  );
}
export default App;
