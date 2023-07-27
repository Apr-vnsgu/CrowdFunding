import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { useQuery, gql, useLazyQuery } from '@apollo/client';
import NavBarPanel from './components/NavBar';
import FooterComponent from './components/FooterComponent';
import { fetchProjects } from './store/projectSlice';
import ContextFunc from './context/ContextFunc';
import { setJwt, removeJwt } from './store/loginSlice';
import { removeTempUser, setTempUser } from './store/tempUser';

const getProjects = gql`
  query GetProjects {
    getProjects {
      project_id
      project_name
      target_amount
      username
      image
      pledge_amount
      end_date
      description
    }
  }
`;
const user = gql`
  query GetUser($username: String!) {
    getUser(username: $username) {
      user_id
      user_name
      username
      bookmarks
    }
  }
`;

const RootLayout = () => {
  const jwt = useSelector((state) => state.jwt);
  const { data, loading, refetch } = useQuery(getProjects);
  const [getUserFunc, userOptions] = useLazyQuery(user);
  const contextFunctions = {
    loading,
    refetch,
    userOptions,
  };
  const dispatch = useDispatch();
  useEffect(() => {
    data && dispatch(fetchProjects(data.getProjects));
  }, [data, dispatch]);
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt && jwt.length !== 0) {
      dispatch(setJwt(jwt));
      if (userOptions.data) {
        dispatch(setTempUser(userOptions.data.getUser));
      }
    } else {
      dispatch(removeJwt());
      dispatch(removeTempUser());
    }
  }, [dispatch, userOptions.data, jwt]);
  useEffect(() => {
    if (jwt.length !== 0) {
      const part = jwt.split('.');
      const payloadBase = part[1];
      const payload = JSON.parse(atob(payloadBase));
      getUserFunc({
        variables: {
          username: payload.username,
        },
      });
    }
  }, [getUserFunc, jwt]);
  return (
    <>
      <ContextFunc.Provider value={contextFunctions}>
        <SnackbarProvider
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          style={{ opacity: '90%' }}
        >
          <NavBarPanel />
          <main>
            <Outlet />
          </main>
          <FooterComponent />
        </SnackbarProvider>
      </ContextFunc.Provider>
    </>
  );
};

export default RootLayout;
