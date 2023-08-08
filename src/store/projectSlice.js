import { createSlice } from '@reduxjs/toolkit';

const projectSlice = createSlice({
  name: 'projects',
  initialState: [],
  reducers: {
    fetchProjects(state, action) {
      state.splice(0, state.length);
      state.push(action.payload);
    },
    updateProject(state, action) {
      const updatedProject = action.payload;

      const projectIndex = state[0].findIndex(
        (project) => project.project_id === updatedProject.project_id
      );

      if (projectIndex !== -1) {
        state[0][projectIndex] = updatedProject;
      }
    },
  },
});

export const { fetchProjects, updateProject } = projectSlice.actions;
export default projectSlice.reducer;
