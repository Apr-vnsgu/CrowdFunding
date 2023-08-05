import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { useQuery, gql, useLazyQuery } from '@apollo/client';
import NavBarPanel from './components/NavBar';
import { fetchProjects } from './store/projectSlice';
import ContextFunc from './context/ContextFunc';
import { setJwt, removeJwt } from './store/loginSlice';
import { removeTempUser, setTempUser } from './store/tempUser';
import { fetchFaq } from './store/faqSlice';
import { setCountsTemp } from './store/countSlice';
import FooterComponent from './components/FooterComponent';

const getProjects = gql`
  query GetProjects {
    getProjects {
      project_id
      project_name
      target_amount
      username
      image
      catagory
      likes
      pledges
      pledge_amount
      end_date
      description
      comments
    }
  }
`;
const getFaqs = gql`
  query GetFaqs {
    getFaqs {
      id
      project_name
      question
      to
      from
      answer
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
      likedProjects
    }
  }
`;

const RootLayout = () => {
  const dispatch = useDispatch();
  const jwt = useSelector((state) => state.jwt);
  const { data, loading, refetch } = useQuery(getProjects);
  const faqs = useQuery(getFaqs);
  const [getUserFunc, userOptions] = useLazyQuery(user);
  const [obj, setObj] = useState({
    totalPledges: 0,
    pledgesAmount: 0,
    pledgedProjects: 0,
  });
  const contextFunctions = {
    loading,
    refetch,
    userOptions,
    faqs,
  };
  useEffect(() => {
    const c =
      data &&
      data.getProjects.map((project) => {
        return project.pledges;
      });
    const d =
      data &&
      data.getProjects.map((project) => {
        return project.pledge_amount;
      });
    setObj({
      pledgedProjects:
        data &&
        data.getProjects.filter((project) => project.pledge_amount > 0).length,
      pledgesAmount: d && d.reduce((acc, currVal) => acc + currVal, 0),
      totalPledges: c && c.reduce((acc, currVal) => acc + currVal, 0),
    });
  }, [data]);
  useEffect(() => {
    if (obj) {
      dispatch(setCountsTemp(obj));
    }
  }, [dispatch, obj]);
  useEffect(() => {
    data && dispatch(fetchProjects(data.getProjects));
  }, [data, dispatch]);
  useEffect(() => {
    faqs.data && dispatch(fetchFaq(faqs.data.getFaqs));
  }, [dispatch, faqs.data]);
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
