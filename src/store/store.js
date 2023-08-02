import { configureStore } from '@reduxjs/toolkit';
import projectSlice from './projectSlice';
import imageSlice from './imageSlice';
import createProjectSlice from './createProjectSlice';
import tempData from './tempData';
import loginSlice from './loginSlice';
import tempUserSlice from './tempUser';
import catagorySlice from './catagorySlice';
import catagorizedProjects from './catagorizedProjects';
import faqSlice from './faqSlice';
const store = configureStore({
  reducer: {
    projects: projectSlice,
    image: imageSlice,
    temp: tempData,
    createProject: createProjectSlice,
    jwt: loginSlice,
    tempUser: tempUserSlice,
    catagory: catagorySlice,
    catagorizedProjects: catagorizedProjects,
    faq: faqSlice,
  },
});

export default store;
