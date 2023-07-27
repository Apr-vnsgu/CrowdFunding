import { configureStore } from '@reduxjs/toolkit';
import projectSlice from './projectSlice';
import imageSlice from './imageSlice';
import createProjectSlice from './createProjectSlice';
import tempData from './tempData';
import loginSlice from './loginSlice';
import tempUserSlice from './tempUser';
const store = configureStore({
  reducer: {
    projects: projectSlice,
    image: imageSlice,
    temp: tempData,
    createProject: createProjectSlice,
    jwt: loginSlice,
    tempUser: tempUserSlice,
  },
});

export default store;
