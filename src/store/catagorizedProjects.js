import { createSlice } from '@reduxjs/toolkit';

const catagorizedProjectsSlice = createSlice({
  name: 'catagorizedProjects',
  initialState: [],
  reducers: {
    fetchProjects(state, action) {
      state.splice(0, state.length);
      state.push(action.payload);
    },
    reset(state) {
      state.splice(0, state.length);
    },
  },
});

export const { fetchProjects, reset } = catagorizedProjectsSlice.actions;
export default catagorizedProjectsSlice.reducer;
