import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formData: {
    project_title: '',
    project_description: '',
    target_amount: 0,
    catagory: '',
    end_date: '',
  },
};

const createProjectSlice = createSlice({
  name: 'createProject',
  initialState,
  reducers: {
    updateField(state, action) {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    resetField(state) {
      state.formData = { ...initialState.formData };
    },
  },
});

export const { updateField, resetField } = createProjectSlice.actions;
export default createProjectSlice.reducer;
