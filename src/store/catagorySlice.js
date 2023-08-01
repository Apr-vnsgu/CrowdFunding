import { createSlice } from '@reduxjs/toolkit';

const catagorySlice = createSlice({
  name: 'catagory',
  initialState: '',
  reducers: {
    addCatagory(state, action) {
      state = '';
      return (state = action.payload);
    },
    removeCatagory(state, action) {
      return (state = '');
    },
  },
});

export const { addCatagory, removeCatagory } = catagorySlice.actions;
export default catagorySlice.reducer;
