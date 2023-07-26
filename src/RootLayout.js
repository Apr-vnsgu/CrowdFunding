import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { useQuery, gql } from '@apollo/client';
import NavBarPanel from './components/NavBar';
import FooterComponent from './components/FooterComponent';
import { fetchProjects } from './store/projectSlice';
import ContextFunc from './context/ContextFunc';

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

const RootLayout = () => {
  const { data, loading, refetch } = useQuery(getProjects);
  const contextFunctions = {
    loading,
    refetch,
  };
  const dispatch = useDispatch();
  useEffect(() => {
    data && dispatch(fetchProjects(data.getProjects));
  }, [data, dispatch]);
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
