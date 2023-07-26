import { configureStore } from '@reduxjs/toolkit';
import demoSlice from './demoSlice';
import projectSlice from './projectSlice';
import imageSlice from './imageSlice';
import createProjectSlice from './createProjectSlice';
import tempData from './tempData';
const store = configureStore({
  reducer: {
    demo: demoSlice,
    projects: projectSlice,
    image: imageSlice,
    temp: tempData,
    createProject: createProjectSlice,
  },
});

export default store;
