import { createSlice } from '@reduxjs/toolkit';

const projectSlice = createSlice({
  name: 'projects',
  initialState: [],
  reducers: {
    fetchProjects(state, action) {
      state.splice(0, state.length);
      state.push(action.payload);
    },
  },
});

export const { fetchProjects } = projectSlice.actions;
export default projectSlice.reducer;
