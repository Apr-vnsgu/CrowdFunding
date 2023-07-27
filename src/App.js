import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux';
import RootLayout from './RootLayout';
import DashBoard from './components/DashBoard';
import Projects from './components/Projects';
import client from './graphql/client';
import store from './store/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateProject from './components/CreateProject';
import Login from './components/Login';
import SignUp from './components/SignUp';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route index element={<Projects />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/project' element={<DashBoard />} />
        <Route path='/create' element={<CreateProject />} />
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
